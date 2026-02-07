const OpenAI = require("openai");
const Bin = require("../models/Bin");
const Recommendation = require("../models/Recommendation");
require("dotenv").config();
const connectDB = require("./db");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.AI_API_KEY,
});

// Generate aggregated data for AI insights
async function generateAggregatedData() {
  try {
    const [
      overallStats,
      wardStats,
      criticalBins,
      wasteTypeStats,
      fillDistribution,
    ] = await Promise.all([
      // Overall statistics
      Bin.aggregate([
        {
          $group: {
            _id: null,
            totalBins: { $sum: 1 },
            averageFill: { $avg: "$bin_fill_percent" },
            maxFill: { $max: "$bin_fill_percent" },
            minFill: { $min: "$bin_fill_percent" },
            totalWeight: { $sum: { $sum: "$waste_breakdown.weight" } },
          },
        },
      ]),

      // Ward-based statistics
      Bin.aggregate([
        {
          $group: {
            _id: "$ward",
            binCount: { $sum: 1 },
            averageFill: { $avg: "$bin_fill_percent" },
            criticalBins: {
              $sum: {
                $cond: [{ $gte: ["$bin_fill_percent", 80] }, 1, 0],
              },
            },
            warningBins: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$bin_fill_percent", 60] },
                      { $lt: ["$bin_fill_percent", 80] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            totalWeight: { $sum: { $sum: "$waste_breakdown.weight" } },
          },
        },
        { $sort: { averageFill: -1 } },
      ]),

      // Critical bins needing immediate attention
      Bin.aggregate([
        { $match: { bin_fill_percent: { $gte: 80 } } },
        {
          $project: {
            bin_id: 1,
            name: 1,
            ward: 1,
            bin_fill_percent: 1,
            location: 1,
            updatedAt: 1,
          },
        },
        { $sort: { bin_fill_percent: -1 } },
        { $limit: 10 },
      ]),

      // Waste type distribution
      Bin.aggregate([
        { $unwind: "$waste_breakdown" },
        {
          $group: {
            _id: "$waste_breakdown.waste_type",
            count: { $sum: 1 },
            totalWeight: { $sum: "$waste_breakdown.weight" },
            averageWeight: { $avg: "$waste_breakdown.weight" },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Fill level distribution
      Bin.aggregate([
        {
          $bucket: {
            groupBy: "$bin_fill_percent",
            boundaries: [0, 25, 50, 75, 80, 100],
            default: "other",
            output: {
              count: { $sum: 1 },
              bins: { $push: "$bin_id" },
            },
          },
        },
      ]),
    ]);

    // Format the aggregated data
    const aggregatedData = {
      summary: {
        total: overallStats[0]?.totalBins || 0,
        averageFill: Math.round(overallStats[0]?.averageFill || 0),
        maxFill: overallStats[0]?.maxFill || 0,
        minFill: overallStats[0]?.minFill || 0,
        totalWeight: Math.round(overallStats[0]?.totalWeight || 0),
      },
      wards: wardStats.map((ward) => ({
        name: ward._id,
        bins: ward.binCount,
        avgFill: Math.round(ward.averageFill),
        critical: ward.criticalBins,
        warning: ward.warningBins,
        weight: Math.round(ward.totalWeight),
      })),
      criticalBins: criticalBins.map((bin) => ({
        id: bin.bin_id,
        name: bin.name,
        ward: bin.ward,
        fill: bin.bin_fill_percent,
        location: bin.location,
        lastUpdated: bin.updatedAt,
      })),
      wasteTypes: wasteTypeStats.map((waste) => ({
        type: waste._id,
        count: waste.count,
        weight: Math.round(waste.totalWeight),
        avgWeight: Math.round(waste.averageWeight),
      })),
      fillDistribution: fillDistribution.map((bucket) => ({
        range: bucket._id === "other" ? "100+" : `${bucket._id}%`,
        count: bucket.count,
        bins: bucket.bins,
      })),
    };

    return aggregatedData;
  } catch (error) {
    console.error("Data aggregation error:", error);
    throw error;
  }
}

// Get previous insights for pattern recognition
async function getPrevInsights() {
  try {
    const prevRecommendations = await Recommendation.find()
      .sort({ createdAt: -1 })
      .limit(3); // Get last 3 insights

    return prevRecommendations.map((rec) => {
      try {
        const parsedData = JSON.parse(rec.text);
        return {
          timestamp: rec.createdAt,
          insights: parsedData.insights || [],
          alerts: parsedData.alerts || [],
          success: parsedData.success || false,
        };
      } catch (parseError) {
        // Handle legacy text recommendations
        return {
          timestamp: rec.createdAt,
          insights: [rec.text],
          alerts: [],
          success: true,
        };
      }
    });
  } catch (error) {
    console.error("Error fetching previous insights:", error);
    return [];
  }
}

// Generate AI insights using aggregated data and previous insights
async function generateWasteInsights() {
  try {
    const [aggregatedData, prevInsights] = await Promise.all([
      generateAggregatedData(),
      getPrevInsights(),
    ]);

    const prompt = `
Analyze this waste management data and return ONLY valid JSON. Use previous insights for pattern recognition and trend analysis:

CURRENT DATA: ${JSON.stringify(aggregatedData, null, 2)}

PREVIOUS INSIGHTS (for pattern recognition):
${JSON.stringify(prevInsights, null, 2)}

Based on current data and previous patterns, return EXACTLY this JSON structure with no additional text:

{
  "insights": [
    "Trend analysis comparing current vs previous patterns",
    "Ward performance evolution and changes",
    "Fill rate progression and predictive insights", 
    "Resource optimization based on historical patterns",
    "Collection efficiency improvements identified",
    "Geographic hotspot pattern recognition",
    "Waste type distribution trends over time",
    "Operational efficiency changes observed",
    "Risk management patterns and predictions",
    "Strategic improvements based on historical data"
  ],
  "alerts": [
    "Brief alert message with trend context and solutions",
    "Pattern-based warning with historical comparison",
    "Predictive alert based on observed trends"
  ]
}

ANALYSIS GUIDELINES:
- Compare current metrics with previous insights
- Identify improving or deteriorating trends
- Look for recurring patterns in critical bins
- Analyze ward performance changes over time
- Provide predictive insights based on historical data
- Focus on actionable recommendations
- Highlight successful interventions from previous periods
-Something thatll look smooth on a dashborad not bulky text.

IMPORTANT: Return ONLY the JSON object, no additional text or explanations.
`;

    console.log("🤖 Making AI API call...");

    const completion = await openai.chat.completions.create({
      model: "tngtech/deepseek-r1t-chimera:free",
      messages: [
        {
          role: "system",
          content:
            "You are a waste management analyst with access to historical data. Analyze patterns and trends to provide predictive insights. Return ONLY valid JSON with no additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2, // Lower temperature for more consistent output
      max_tokens: 1500,
    });

    // Check if the response is valid
    if (!completion || !completion.choices || completion.choices.length === 0) {
      console.error("Invalid AI response structure:", completion);
      throw new Error("AI API returned invalid response structure");
    }

    const responseText = completion.choices[0].message?.content?.trim();

    if (!responseText) {
      console.error("Empty response from AI");
      throw new Error("AI API returned empty response");
    }

    console.log("Raw AI Response:", responseText);

    // Parse the JSON response
    let parsedResponse;
    try {
      // Try to extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : responseText;

      parsedResponse = JSON.parse(jsonText);

      // Validate the parsed response has required fields
      if (!parsedResponse.insights || !Array.isArray(parsedResponse.insights)) {
        throw new Error("Invalid response format - missing insights array");
      }

      if (!parsedResponse.alerts || !Array.isArray(parsedResponse.alerts)) {
        throw new Error("Invalid response format - missing alerts array");
      }
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Response was:", responseText);

      // Fallback if parsing fails
      throw new Error(`Invalid JSON response from AI: ${parseError.message}`);
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      dataAnalyzed: aggregatedData.summary.total,
      insights: parsedResponse.insights || [],
      alerts: parsedResponse.alerts || [],
      rawData: aggregatedData,
      previousInsights: prevInsights.length,
    };
  } catch (error) {
    console.error("AI Insights Error:", error);

    // Generate fallback response with current data
    const basicData = await generateAggregatedData().catch(() => ({
      summary: { total: 0, averageFill: 0 },
      criticalBins: [],
      wards: [],
    }));

    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      dataAnalyzed: basicData.summary.total,
      insights: [
        `Total of ${basicData.summary.total} bins monitored across Lagos State`,
        `System average fill level is ${basicData.summary.averageFill}%`,
        `${basicData.criticalBins.length} bins currently at critical capacity (>80%)`,
        `${basicData.wards.length} wards actively participating in smart waste monitoring`,
        "AI analysis temporarily unavailable - using fallback insights",
        "Manual review recommended for critical bins requiring immediate attention",
        "Ward performance monitoring continues with real-time data collection",
        "Collection route optimization needed based on current fill levels",
        "Real-time IoT monitoring system operational and collecting data",
        "Recommend immediate attention to bins exceeding 80% capacity",
      ],
      alerts: [
        `URGENT: ${basicData.criticalBins.length} bins require immediate collection`,
        "AI system temporarily unavailable - manual monitoring in effect",
        "Continue surveillance - system data collection remains operational",
      ],
      rawData: basicData,
      previousInsights: 0,
    };
  }
}

// Save AI insights as stringified JSON
async function saveAIInsights() {
  try {
    console.log("🔄 Starting AI insights generation...");
    const aiResult = await generateWasteInsights();

    const recommendation = new Recommendation({
      text: JSON.stringify(aiResult), // Store entire response as string
      relatedZone: "All Wards", // Optional
    });

    await recommendation.save();
    console.log("✅ AI insights saved to database successfully");

    return recommendation;
  } catch (error) {
    console.error("❌ Failed to save AI insights:", error);

    // Create a basic fallback recommendation
    try {
      const fallbackRecommendation = new Recommendation({
        text: JSON.stringify({
          success: false,
          error: "System error during insights generation",
          timestamp: new Date().toISOString(),
          insights: ["System monitoring active", "Manual review recommended"],
          alerts: ["AI insights generation failed - check system logs"],
        }),
        relatedZone: "System Error",
      });

      await fallbackRecommendation.save();
      console.log("✅ Fallback recommendation saved");
    } catch (fallbackError) {
      console.error(
        "❌ Failed to save fallback recommendation:",
        fallbackError,
      );
    }

    throw error;
  }
}

module.exports = {
  generateWasteInsights,
  generateAggregatedData,
  getPrevInsights,
  openai,
  saveAIInsights,
};
