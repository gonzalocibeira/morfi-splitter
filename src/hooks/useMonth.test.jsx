import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { FireContext } from "../Context/FireContext";
import useMonth from "./useMonth";
function Consumer({ monthKey }) {
    useMonth(monthKey);
    return null;
}
test("revalidates the visible month on focus and removes listeners on unmount", () => {
    const loadMonth = jest.fn().mockResolvedValue([]);
    const view = render(
        <FireContext.Provider value={{ getMonth: () => ({}), loadMonth }}>
            <Consumer monthKey="2026-10" />
        </FireContext.Provider>,
    );
    expect(loadMonth).toHaveBeenCalledTimes(1);
    fireEvent(window, new Event("focus"));
    expect(loadMonth).toHaveBeenCalledTimes(2);
    expect(loadMonth).toHaveBeenLastCalledWith("2026-10");
    view.unmount();
    fireEvent(window, new Event("focus"));
    expect(loadMonth).toHaveBeenCalledTimes(2);
});
