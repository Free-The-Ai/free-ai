import { createSignal } from "solid-js";
import { Button, TextField, Select, Switch } from "./ui";
import type { SelectOption } from "./ui";

const TOPIC_OPTIONS: SelectOption[] = [
  { value: "bug", label: "Bug report" },
  { value: "feature", label: "Feature request" },
  { value: "docs", label: "Documentation" },
  { value: "other", label: "Other feedback" },
];

type Status = "idle" | "sending" | "sent" | "error";

export default function FeedbackForm() {
  const [subject, setSubject] = createSignal("");
  const [topic, setTopic] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [notify, setNotify] = createSignal(false);
  const [status, setStatus] = createSignal<Status>("idle");
  const [error, setError] = createSignal("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!message().trim()) {
      setError("Please enter a message.");
      return;
    }
    setError("");
    setStatus("sending");

    try {
      console.log("[FeedbackForm]", {
        subject: subject(),
        topic: topic() || "other",
        message: message(),
        notify: notify(),
      });
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStatus("sent");
      setSubject("");
      setTopic("");
      setMessage("");
      setNotify(false);
    } catch (err) {
      setStatus("error");
      setError(String(err));
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

      {error() && <p class="feedback-form__error">{error()}</p>}
      {status() === "sent" && (
        <p class="feedback-form__success">Thanks for your feedback.</p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={status() === "sending" || status() === "sent"}
      >
        {status() === "sending" ? "Sending..."
          : status() === "sent" ? "Sent!"
          : "Send Feedback"}
      </Button>
    </form>
  );
}
