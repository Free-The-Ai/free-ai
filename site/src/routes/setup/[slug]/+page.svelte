<script lang="ts">
    import SetupDetailPage from "@/pages/setup-detail";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
</script>

<SetupDetailPage guide={data.guide} />
