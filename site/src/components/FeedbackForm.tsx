import { createSignal } from "solid-js";
import { Button, TextField, Select, Switch, showToast } from "./ui";
import type { SelectOption } from "./ui";

const TOPIC_OPTIONS: SelectOption[] = [
  { value: "bug", label: "Bug report" },
  { value: "feature", label: "Feature request" },
  { value: "docs", label: "Documentation" },
  { value: "other", label: "Other feedback" },
];

export default function FeedbackForm() {
  const [subject, setSubject] = createSignal("");
  const [topic, setTopic] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [notify, setNotify] = createSignal(false);
  const [sending, setSending] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!message().trim()) {
      showToast("Missing message", "Please enter a message before sending.", "error");
      return;
    }
    setSending(true);

    try {
      console.log("[FeedbackForm]", {
        subject: subject(),
        topic: topic() || "other",
        message: message(),
        notify: notify(),
      });
      await new Promise((resolve) => setTimeout(resolve, 600));
      showToast("Feedback sent", "Thanks for helping us improve.", "success");
      setSubject("");
      setTopic("");
      setMessage("");
      setNotify(false);
    } catch (err) {
      showToast("Failed to send", String(err), "error");
    } finally {
      setSending(false);
    }
  };

  const handleTopicChange = (val: string) => {
    setTopic(val ?? "");
  };

  return (
    <form onSubmit={handleSubmit} class="feedback-form">
      <TextField
        label="Subject"
        value={subject()}
        onChange={setSubject}
        placeholder="Brief summary of your feedback"
      />

      <Select
        label="Topic"
        placeholder="Select a topic..."
        options={TOPIC_OPTIONS}
        value={topic()}
        onChange={handleTopicChange}
      />

      <TextField
        label="Message"
        multiline
        value={message()}
        onChange={setMessage}
        placeholder="Tell us what's on your mind..."
      />

      <Switch
        label="Notify me about updates"
        checked={notify()}
        onChange={setNotify}
      />

      <Button
        type="submit"
        variant="primary"
        disabled={sending()}
      >
        {sending() ? "Sending..." : "Send Feedback"}
      </Button>
    </form>
  );
}
