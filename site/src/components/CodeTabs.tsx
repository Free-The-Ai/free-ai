import { Tabs } from "./ui";
import type { Tab } from "./ui";

interface CodeExample {
    kicker: string;
    title: string;
    code: string;
    html?: string;
    lang?: string;
}

export default function CodeTabs(props: { examples: CodeExample[] }) {
    const tabs: Tab[] = props.examples.map((ex) => ({
        value: ex.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        label: ex.title,
    }));

    return (
        <Tabs tabs={tabs}>
            {(activeTab) => {
                const ex = props.examples.find(
                    (e) =>
                        e.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") ===
                        activeTab,
                );
                if (!ex) return null;

                return (
                    <div class="panel code-panel">
                        <div class="panel-kicker">{ex.kicker}</div>
                        <div class="docs-code-group">
                            {ex.lang ? (
                                <div class="docs-code-bar">
                                    <span class="docs-code-lang">
                                        {ex.lang}
                                    </span>
                                    <button
                                        class="copy-btn"
                                        type="button"
                                        title="Copy"
                                        aria-label="Copy to clipboard"
                                    >
                                        <span class="material-symbols-outlined">
                                            content_copy
                                        </span>
                                    </button>
                                </div>
                            ) : null}
                            {ex.html ? (
                                <div
                                    class="shiki-wrapper"
                                    innerHTML={ex.html}
                                />
                            ) : (
                                <pre>
                                    <code>{ex.code}</code>
                                </pre>
                            )}
                        </div>
                    </div>
                );
            }}
        </Tabs>
    );
}
