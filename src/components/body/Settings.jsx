import React, { useContext } from "react";
import { UIContext } from "../../Context/UIContext";
import { Card, PageTitle } from "../ui/Primitives";

export default function Settings() {
    const { legacyUI, setLegacyUI } = useContext(UIContext);
    return (
        <>
            <PageTitle title="Settings" icon="settings" />
            <Card className="settings-card">
                <h2>Appearance</h2>
                <label className="appearance-toggle">
                    <span>
                        <strong>Legacy UI</strong>
                        <small id="legacy-ui-description">
                            Use the original handmade interface, with its blue-grey colours,
                            illustrated icons, and compact layouts. Saved in this browser.
                        </small>
                    </span>
                    <input
                        type="checkbox"
                        role="switch"
                        aria-label="Legacy UI"
                        aria-describedby="legacy-ui-description"
                        checked={legacyUI}
                        onChange={(event) => setLegacyUI(event.target.checked)}
                    />
                </label>
            </Card>
        </>
    );
}
