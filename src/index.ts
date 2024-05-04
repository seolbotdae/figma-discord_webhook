import { slugify } from "./helpers";
import { CustomParameters, PluginMessage, WebhookMessage } from "./types";

figma.skipInvisibleInstanceChildren = true;

figma.showUI(__html__, { visible: false });

figma.ui.onmessage = async (data: PluginMessage) => {
  const { status, code } = data;

  console.log(data)
  console.log(status)
  console.log(code)

  const message =
    status === "success"
      ? "Successfully uploaded!"
      : `(${code}) Error sending request, you may be sending too much data.`;

  figma.notify(message, { error: status !== "success", timeout: 5000 });
  figma.closePlugin();
};

figma.parameters.on("input", async ({ query, key, result }) => {
  switch (key) {
    case "shareLinks":
      result.setSuggestions(["true", "false"]);
      break;
    default:
      result.setSuggestions([]);
  }
});

figma.on("run", async ({ parameters }: RunEvent) => {
  const {
    description,
    threadName,
    shareLinks: shareLinksStr,
  } = parameters as CustomParameters;

  // validate and treat shareLinks as a boolean, dumb
  const shareLinks =
    shareLinksStr === "true" ? true : shareLinksStr === "false" ? false : true; // default to true

  // filter out nodes that are not supported
  const selection = figma.currentPage.selection.filter(
    (node) =>
      node.type === "FRAME" ||
      node.type === "GROUP" ||
      node.type === "COMPONENT" ||
      node.type === "INSTANCE" ||
      node.type === "VECTOR" ||
      node.type === "SECTION" ||
      node.type === "COMPONENT_SET"
  );

  // Check if the user has selected any nodes
  if (selection.length === 0) {
    figma.notify(
      "Please select at least [1] Frame or Group to send to Discord.",
      {
        timeout: 5000,
        error: true,
      }
    );

    return figma.closePlugin();
  }

  // Check if the user has selected more than [6] nodes
  if (selection.length > 6) {
    figma.notify(
      "Please select less than [6] items, or try grouping them together.",
      { error: true, timeout: 5000 }
    );
    return figma.closePlugin();
  }

  // Construct Attachments
  const attachmentsData = await Promise.all(
    selection.map(async (selectedNode) => ({
      blob: await selectedNode.exportAsync({
        format: "PNG",
        contentsOnly: true,
        constraint: { type: "SCALE", value: 1 },
      }),
      name: selectedNode.name,
      url: `https://www.figma.com/file/${figma.fileKey}?node-id=${selectedNode.id}`,
      slug: slugify(selectedNode.name),
    }))
  );

  // Construct Content
  let content = description ? `## \`${description}\`\n` : "";

  // Add attachment details to the content
  if (shareLinks) {
    content += `> ${getDateTime()}\n\n`

    attachmentsData.forEach((attachment, index) => {
      content += `[Link to Figma : ${attachment.name}](<${attachment.url}>)\n`;
    });
  }

  const msg: WebhookMessage = {
    type: "sendWebhook",
    webhookUrl: process.env.WEBHOOK_URL,
    content,
    threadName,
    attachmentsData,
    figmaData: {
      username: figma.currentUser.name,
      avatarUrl: figma.currentUser.photoUrl,
      fileUrl: shareLinks ? `https://www.figma.com/file/${figma.fileKey}` : "",
    },
    discordData: {
      username: figma.currentUser.name, // somehow ask for their discord username, for now use Figma name
    },
  };

  setTimeout(() => figma.ui.postMessage(msg), 1);
});

function getDateTime(): string {
  const now: Date = new Date();

  const year: number = now.getFullYear();
  const month: number = now.getMonth() + 1;
  const day: number = now.getDate();
  const hours: number = now.getHours();
  const minutes: number = now.getMinutes();

  const formattedMonth: string = month.toString().padStart(2, '0');
  const formattedDay: string = day.toString().padStart(2, '0');
  const formattedHours: string = hours.toString().padStart(2, '0');
  const formattedMinutes: string = minutes.toString().padStart(2, '0');

  return `${year}.${formattedMonth}.${formattedDay} ${formattedHours}:${formattedMinutes}`;
}
