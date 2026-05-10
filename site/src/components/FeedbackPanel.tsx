import { Collapsible } from "./ui";
import FeedbackForm from "./FeedbackForm";

export default function FeedbackPanel() {
  return (
    <section class="panel docs-card" id="feedback">
      <div class="eyebrow">FEEDBACK</div>
      <Collapsible title="Share your thoughts">
        <p>
          Bug reports, feature ideas, docs improvements. Let us know what you need.
        </p>
        <FeedbackForm />
      </Collapsible>
    </section>
  );
}
