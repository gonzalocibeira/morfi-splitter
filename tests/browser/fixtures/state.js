const params = new URLSearchParams(location.search);
export const scenario = params.get("scenario") || "normal";
const count = scenario === "large" ? 1000 : scenario === "empty" ? 0 : 8;
export const names =
    scenario === "long"
        ? [
              "AlexandraWithAnExtremelyLongUnbrokenParticipantName",
              "Samuel With A Long Participant Name",
          ]
        : ["Alex", "Sam"];
const categories = ["Supermarket", "Food", "Utilities", "Other"];
const now = new Date();
export const state = {
    user: scenario === "anonymous" ? null : { uid: "fixture-household", email: "alex@example.com" },
    expenses: Array.from({ length: count }, (_, index) => ({
        id: `fixture-${index}`,
        data: {
            name: names[index % 2],
            amountCents: [4250, 1850, 9200, 750, 3640, 2200, 1199, 1480][index % 8],
            date: new Date(now.getFullYear(), now.getMonth(), 1 + (index % 20), 12, 0, index),
            category: categories[index % 4],
            note:
                scenario === "long"
                    ? "Averylongunbrokenexpensenotethatmustwrapsafelywithoutbreakingthemobilelayout".repeat(
                          4,
                      )
                    : [
                          "The weekly shop",
                          "Lunch together",
                          "Electricity bill",
                          "A little something",
                      ][index % 4],
            nonSplit: index % 7 === 3,
        },
    })),
    reads: 0,
    writes: 0,
    listeners: new Set(),
    failRefresh: false,
};
export const pause = (ms = 35) => new Promise((resolve) => setTimeout(resolve, ms));
