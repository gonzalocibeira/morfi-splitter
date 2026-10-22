import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const currentKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};
const go = (page, name) =>
    page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name, exact: true })
        .click();
async function ready(page, scenario = "normal", path = "/") {
    await page.goto(`${path}?scenario=${scenario}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}
test("all workflows: create, shared month, charts, comma edit, cancel, and delete", async ({
    page,
}) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await ready(page);
    await expect(page.locator(".hero-amount")).toBeVisible();
    await go(page, "Add expense");
    await page.getByLabel("Paid by").selectOption("Alex");
    await page.getByLabel("Amount", { exact: true }).fill("12,34");
    await page.getByLabel("Category", { exact: true }).selectOption("Food");
    await page.getByLabel(/Note/).fill("Browser test expense");
    await page.getByRole("checkbox").check();
    await expect(page.getByText("Sam will owe Alex the full amount.")).toBeVisible();
    await page.getByRole("button", { name: "Save expense" }).click();
    await expect(page.getByRole("status")).toContainText("Expense added");
    await go(page, "Split");
    await expect(page.getByLabel("Expense month")).toHaveValue(currentKey());
    await page.getByLabel("Expense month").fill("2025-12");
    await expect(page.getByText("There are no expenses in this month.")).toBeVisible();
    await go(page, "Details");
    await expect(page.getByLabel("Expense month")).toHaveValue("2025-12");
    await page.getByLabel("Expense month").fill(currentKey());
    await expect(page.getByRole("article")).toHaveCount(9);
    await page.getByRole("button", { name: "By category", exact: true }).click();
    await expect(page.getByRole("button", { name: "By category", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
    );
    await expect(page.getByRole("list", { name: "Chart amounts" })).toBeVisible();
    await page.getByRole("button", { name: "By user", exact: true }).click();
    await expect(
        page.getByRole("list", { name: "Chart amounts" }).getByRole("listitem"),
    ).toHaveCount(2);
    const row = page.getByRole("article").filter({ hasText: "Browser test expense" });
    await row.getByRole("button", { name: "Expense options" }).click();
    await row.getByRole("button", { name: "Edit amount" }).click();
    await expect(row.getByLabel("New amount")).toBeFocused();
    await row.getByLabel("New amount").fill("99,98");
    await row.getByRole("button", { name: "Cancel", exact: true }).click();
    await row.getByRole("button", { name: "Edit amount" }).click();
    await expect(row.getByLabel("New amount")).toHaveValue("12.34");
    await row.getByLabel("New amount").fill("19,99");
    await row.getByLabel("New amount").press("Enter");
    await expect(row.locator(".expense-amount")).toContainText("19.99");
    await row.getByRole("button", { name: "Expense options" }).click();
    await row.getByRole("button", { name: "Delete entry" }).click();
    await expect(page.getByRole("dialog")).toContainText("Browser test expense");
    await expect(
        page.getByRole("dialog").getByRole("button", { name: "Cancel", exact: true }),
    ).toBeFocused();
    await page.getByRole("dialog").getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(row.getByRole("button", { name: "Delete entry" })).toBeFocused();
    await row.getByRole("button", { name: "Delete entry" }).click();
    await page.getByRole("button", { name: "Delete expense", exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(8);
    expect(errors).toEqual([]);
});
test("protected route survives login and logout returns to a usable login screen", async ({
    page,
}) => {
    await ready(page, "anonymous", "/detail");
    await page.getByLabel("Email", { exact: true }).fill("alex@example.com");
    await page.getByLabel("Password", { exact: true }).fill("wrong");
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("email or password is incorrect");
    await page.getByLabel("Password", { exact: true }).fill("fixture-password");
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expect(page).toHaveURL(/\/detail$/);
    await expect(page.getByRole("article")).toHaveCount(8);
    await go(page, "Overview");
    await page.getByRole("button", { name: "Logout", exact: true }).click();
    await expect(page.getByRole("button", { name: "Login", exact: true })).toBeVisible();
    await expect(page.getByRole("navigation")).toHaveCount(0);
    const requests = [];
    page.on("request", (request) => requests.push(request.url()));
    await ready(page, "anonymous");
    await expect(page.getByRole("button", { name: "Login", exact: true })).toBeVisible();
    expect(requests.some((url) => url.includes("expenseStore"))).toBe(false);
});
for (const width of [320, 390, 768, 1440]) {
    test(`layouts fit ${width}px and touch controls remain accessible`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await ready(page, "long");
        for (const name of ["Overview", "Add expense", "Split", "Details"]) {
            await go(page, name);
            await expect(page.getByRole("heading", { level: 1 })).toHaveText(
                {
                    Overview: "Overview",
                    "Add expense": "Add expense",
                    Split: "Split expenses",
                    Details: "Expense details",
                }[name],
            );
            await expect(page.locator(".loading-state")).toHaveCount(0);
            const overflow = await page.evaluate(
                () => document.documentElement.scrollWidth > innerWidth + 1,
            );
            expect(overflow, `${name} overflow at ${width}px`).toBe(false);
            const smallTargets = await page
                .locator("button:visible, .nav-item:visible, input:visible, select:visible")
                .evaluateAll((elements) =>
                    elements
                        .filter((element) => {
                            const target = element.matches('input[type="checkbox"]')
                                ? element.closest("label")
                                : element;
                            const rect = target.getBoundingClientRect();
                            return rect.width < 43 || rect.height < 43;
                        })
                        .map((element) => element.outerHTML),
                );
            expect(smallTargets).toEqual([]);
        }
    });
}
test("loading, empty, and error states render useful feedback", async ({ page }) => {
    await ready(page, "loading");
    await expect(page.getByRole("status")).toContainText("Loading expenses");
    await expect(page.locator(".hero-amount")).toHaveCount(0);
    await ready(page, "empty", "/detail");
    await expect(page.getByRole("heading", { name: "No expenses", exact: true })).toBeVisible();
    await ready(page, "error", "/detail");
    await expect(page.getByRole("alert")).toContainText("Unable to reach your expenses");
    await expect(page.getByRole("button", { name: "Retry refresh" })).toBeVisible();
});
test("failed saves preserve form input and successful writes survive failed refreshes", async ({
    page,
}) => {
    await ready(page, "write-error", "/new");
    await page.getByLabel("Paid by").selectOption("Sam");
    await page.getByLabel("Amount", { exact: true }).fill("12,34");
    await page.getByRole("button", { name: "Save expense" }).click();
    await expect(page.getByRole("alert")).toContainText("Could not save");
    await expect(page.getByLabel("Amount", { exact: true })).toHaveValue("12,34");
    await ready(page, "refresh-error", "/detail");
    const row = page.getByRole("article").first();
    await row.getByRole("button", { name: "Expense options" }).click();
    await row.getByRole("button", { name: "Edit amount" }).click();
    await row.getByLabel("New amount").fill("88,88");
    await row.getByRole("button", { name: "Save", exact: true }).click();
    await expect(row.locator(".expense-amount")).toContainText("88.88");
    await expect(page.getByRole("status")).toContainText("saved changes are safe");
    await expect(row.getByLabel("New amount")).toHaveCount(0);
});
test("large months render 50 rows while charts include the entire month", async ({
    page,
}, testInfo) => {
    const navigationStart = performance.now();
    await ready(page, "large", "/detail");
    await expect(page.getByRole("article")).toHaveCount(50);
    const detailReadyMs = performance.now() - navigationStart;
    await expect(page.locator(".count-badge")).toHaveText("1000");
    const chartPaths = await page.locator(".recharts-bar-rectangle").count();
    const start = performance.now();
    await page.getByRole("button", { name: "By category", exact: true }).click();
    await expect(page.getByRole("list", { name: "Chart amounts" })).toBeVisible();
    const chartSwitchMs = performance.now() - start;
    await expect(page.getByRole("list", { name: "Chart amounts" })).toContainText("9,862.50");
    await expect(page.getByRole("list", { name: "Chart amounts" })).toContainText("12,998.75");
    const row = page.getByRole("article").first();
    await row.getByRole("button", { name: "Expense options" }).click();
    await row.getByRole("button", { name: "Edit amount" }).click();
    const inputStart = performance.now();
    await row.getByLabel("New amount").fill("11,22");
    await expect(row.getByLabel("New amount")).toHaveValue("11,22");
    const editMs = performance.now() - inputStart;
    await row.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.getByRole("button", { name: "Show 50 more" }).click();
    await expect(page.getByRole("article")).toHaveCount(100);
    const metricsPath = testInfo.outputPath("performance.json");
    await writeFile(
        metricsPath,
        JSON.stringify(
            {
                detailReadyMs,
                chartSwitchMs,
                editMs,
                chartPaths,
                totalExpenses: 1000,
                initialRows: 50,
            },
            null,
            2,
        ),
    );
    await testInfo.attach("performance-sample", {
        body: JSON.stringify({
            detailReadyMs,
            chartSwitchMs,
            editMs,
            chartPaths,
            totalExpenses: 1000,
            initialRows: 50,
        }),
        contentType: "application/json",
    });
});
test("reduced motion, keyboard focus, and 200% text zoom keep forms usable", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await ready(page, "normal", "/new");
    await expect(page.getByLabel("Paid by")).toBeVisible();
    await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
        true,
    );
    await page.getByLabel("Paid by").focus();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Amount", { exact: true })).toBeFocused();
    await expect(page.getByRole("button", { name: "Save expense" })).toBeEnabled();
});
test("capture the redesigned screens with isolated example data", async ({ page }, testInfo) => {
    const width = testInfo.project.name === "webkit-phone" ? 390 : 1440;
    await page.setViewportSize({ width, height: 900 });
    await ready(page);
    for (const name of ["Overview", "Add expense", "Split", "Details"]) {
        await go(page, name);
        await expect(page.locator(".loading-state")).toHaveCount(0);
        if (name === "Overview" || name === "Split")
            await expect(page.locator(".hero-amount")).toBeVisible();
        if (name === "Details") await expect(page.getByRole("article")).toHaveCount(8);
        if (name === "Add expense") await expect(page.getByLabel("Paid by")).toBeVisible();
        await page.evaluate(() => window.scrollTo(0, 0));
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
        await page.screenshot({
            path: testInfo.outputPath(`${name.toLowerCase().replaceAll(" ", "-")}-viewport.png`),
            scale: "css",
        });
        await page.screenshot({
            path: testInfo.outputPath(`${name.toLowerCase().replaceAll(" ", "-")}.png`),
            fullPage: true,
            scale: "css",
        });
    }
    await ready(page, "anonymous");
    await expect(page.getByRole("button", { name: "Login", exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("login.png"), fullPage: true });
});
test("the real app renders a configuration error without a blank screen or Firestore download", async ({
    page,
}) => {
    const errors = [],
        requests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("http://127.0.0.1:4176/");
    await expect(page.getByRole("alert")).toContainText("Firebase is not configured");
    await expect(page.getByRole("heading", { name: "Login", exact: true })).toBeVisible();
    expect(errors).toEqual([]);
    expect(
        requests.some((url) => url.includes("expenseStore") || url.includes("firebase_firestore")),
    ).toBe(false);
});
test("phone form actions remain reachable when the visual viewport shrinks for the keyboard", async ({
    page,
}) => {
    await page.addInitScript(() => {
        const viewport = new EventTarget();
        Object.defineProperty(viewport, "height", { value: window.innerHeight, writable: true });
        Object.defineProperty(window, "visualViewport", { value: viewport, configurable: true });
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await ready(page, "normal", "/new");
    await page.getByLabel("Amount", { exact: true }).focus();
    await page.evaluate(() => {
        window.visualViewport.height = window.innerHeight - 300;
        window.visualViewport.dispatchEvent(new Event("resize"));
    });
    await expect(page.locator("html")).toHaveClass(/keyboard-open/);
    await expect(page.getByRole("navigation")).toBeHidden();
    await expect(page.getByRole("button", { name: "Save expense" })).toBeVisible();
    const save = await page.getByRole("button", { name: "Save expense" }).boundingBox();
    const visibleBottom = await page.evaluate(() => window.visualViewport.height);
    expect(save.y + save.height).toBeLessThanOrEqual(visibleBottom);
    await page.evaluate(() => {
        window.visualViewport.height = window.innerHeight;
        window.visualViewport.dispatchEvent(new Event("resize"));
    });
    await expect(page.getByRole("navigation")).toBeVisible();
});
test("delete confirmation traps keyboard focus and Escape returns to its trigger", async ({
    page,
}) => {
    await ready(page, "normal", "/detail");
    const row = page.getByRole("article").first();
    await row.getByRole("button", { name: "Expense options" }).click();
    const trigger = row.getByRole("button", { name: "Delete entry" });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("button", { name: "Delete expense", exact: true })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("article")).toHaveCount(8);
});
test("phone expense form keeps notes reachable above the save bar", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 667 });
    await ready(page, "normal", "/new");
    await expect(page.getByLabel(/Note/)).toBeVisible();
    await page.getByLabel(/Note/).scrollIntoViewIfNeeded();
    await page.getByLabel(/Note/).focus();
    const note = await page.getByLabel(/Note/).boundingBox();
    const actions = await page.locator(".form-actions").boundingBox();
    expect(note.y + note.height).toBeLessThanOrEqual(actions.y);
    const hit = await page.getByLabel(/Note/).evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return (
            document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === element
        );
    });
    expect(hit).toBe(true);
    await page.getByLabel(/Note/).fill("Dinner");
    await page.getByLabel("Paid by").selectOption("Alex");
    await page.getByLabel("Amount", { exact: true }).fill("12,34");
    await page.getByRole("button", { name: "Save expense" }).click();
    await expect(page.getByRole("status")).toContainText("Expense added.");
});
test("phone login fields and submit fit without scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await ready(page, "anonymous");
    const login = await page.getByRole("button", { name: "Login", exact: true }).boundingBox();
    expect(login.y + login.height).toBeLessThanOrEqual(568);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Login");
});
test("phone navigation returns to the top after switching screens", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 667 });
    await ready(page);
    for (const [name, title] of [
        ["Add expense", "Add expense"],
        ["Split", "Split expenses"],
        ["Details", "Expense details"],
        ["Overview", "Overview"],
    ]) {
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await go(page, name);
        await expect(
            page.getByRole("heading", { level: 1, name: title, exact: true }),
        ).toBeVisible();
        await expect(page.locator(".loading-state")).toHaveCount(0);
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    }
});
test("keyboard handling supports browsers that resize the whole page and switching fields", async ({
    page,
}) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ready(page, "normal", "/new");
    await page.getByLabel("Amount", { exact: true }).focus();
    await page.setViewportSize({ width: 390, height: 544 });
    await expect(page.locator("html")).toHaveClass(/keyboard-open/);
    await page.getByLabel(/Note/).focus();
    await expect(page.locator("html")).toHaveClass(/keyboard-open/);
    const save = await page.getByRole("button", { name: "Save expense" }).boundingBox();
    expect(save.y + save.height).toBeLessThanOrEqual(544);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator("html")).not.toHaveClass(/keyboard-open/);
    await expect(page.getByRole("navigation")).toBeVisible();
});
