const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment
} = require("@firebase/rules-unit-testing");
const firebase = require("firebase/compat/app");
require("firebase/compat/firestore");

const validExpense = {
    name: "Alex",
    amountCents: 1234,
    date: firebase.firestore.Timestamp.fromDate(new Date("2026-03-04T12:00:00Z")),
    note: "Lunch",
    category: "Food",
    nonSplit: false
};

test("Firestore security rules", async (suite) => {
    const environment = await initializeTestEnvironment({
        projectId: "demo-morfi-splitter",
        firestore: {
            host: "127.0.0.1",
            port: 8080,
            rules: fs.readFileSync("firestore.rules", "utf8")
        }
    });

    try {
        const { amountCents, ...legacyFields } = validExpense;
        assert.equal(amountCents, 1234);
        await environment.withSecurityRulesDisabled(async (context) => {
            const unrestrictedFirestore = context.firestore();
            await unrestrictedFirestore.doc("users/owner").set({ names: ["Alex", "Sam"] });
            await unrestrictedFirestore.doc("expenses/owner/monthly/one").set(validExpense);
            await unrestrictedFirestore.doc("expenses/owner/monthly/legacy").set(
                { ...legacyFields, amount: "12.34" }
            );
        });

        const ownerFirestore = environment.authenticatedContext("owner").firestore();
        const otherFirestore = environment.authenticatedContext("other").firestore();
        const unauthenticatedFirestore = environment.unauthenticatedContext().firestore();

        await suite.test("only the owner can read expenses and profiles", async () => {
            await assertSucceeds(ownerFirestore.doc("expenses/owner/monthly/one").get());
            await assertFails(otherFirestore.doc("expenses/owner/monthly/one").get());
            await assertFails(unauthenticatedFirestore.doc("expenses/owner/monthly/one").get());
            await assertSucceeds(ownerFirestore.doc("users/owner").get());
            await assertFails(otherFirestore.doc("users/owner").get());
        });

        await suite.test("canonical cents are accepted and invalid writes are rejected", async () => {
            await assertSucceeds(ownerFirestore.doc("expenses/owner/monthly/valid").set(validExpense));
            await assertFails(ownerFirestore.doc("expenses/owner/monthly/invalid").set({
                ...validExpense,
                amountCents: 12.34
            }));
            await assertFails(ownerFirestore.doc("expenses/owner/monthly/unknown-participant").set({
                ...validExpense,
                name: "Mallory"
            }));
        });

        await suite.test("legacy records remain readable and migrate when edited", async () => {
            const ownerRef = ownerFirestore.doc("expenses/owner/monthly/legacy");
            const snapshot = await assertSucceeds(ownerRef.get());
            assert.equal(snapshot.data().amount, "12.34");
            await assertSucceeds(ownerRef.update({
                amount: firebase.firestore.FieldValue.delete(),
                amountCents: 1234
            }));
        });
    } finally {
        await environment.cleanup();
    }
});
