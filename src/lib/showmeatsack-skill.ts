export const SHOWMEATSACK_SKILL_MARKDOWN = `# showmeatsack.com

Publish a page, put the view link where the human will see it. This is the
share. Do not invent another host, a gist, a local \`open\`, a file copied
onto their machine, a box-desktop screenshot, or a chat-file attachment
as the way you show the page.

The product is **showmeatsack.com**. The tool is named \`showmeatsack.com\`.
HTTP and the tool are the same share. View links look like
\`https://s.showmeatsack.com/s/…\`.

There is no API key and no account. Create is open. After create, keep
\`manageToken\` for replace, delete, and status. Send it as
\`Authorization: Bearer\`. Do not put it in the URL. Never put that secret
in the conversation or on the viewed page.

## When to use

Use this as soon as you have HTML (or a small static site) that a person
should open. Typical asks:

- "show it on the meat sack"
- "meat sack" / "showmeatsack"
- "share this page" / "preview this HTML" / "give me a link"

If they asked for a page and also asked to show it, publish first, then
paste \`viewUrl\`. A local open or a screenshot can be extra, never the share.

## In this conversation

1. Call \`showmeatsack.com\` with action \`create\` (or \`POST /api/v1/shares\`).
   Send either \`html\` or \`zipBase64\`, not both. A zip must include
   \`index.html\` at the zip root or inside a single wrapping folder.
   Optional \`expiresInSeconds\` (default 30 days, never longer). Cap is 5 MB.
2. You always get \`viewUrl\`, \`manageUrl\`, \`manageToken\`, and \`expiresAt\`
   immediately. Paste **\`viewUrl\` into this conversation** so the person
   here can open it. Do not wait for them to ask for the link.
3. The view link *is* the page. There is no showmeatsack.com chrome around
   it. Scripts and styles are not stripped.
4. To replace or delete, call the same tool with action \`replace\` or
   \`delete\`, passing \`shareId\` and \`manageToken\`. Replace keeps the view
   link. Status uses the same secrets.

## Do not

- Name extra tools. There is one tool, \`showmeatsack.com\`, with actions
  \`create\`, \`status\`, \`replace\`, and \`delete\`.
- Put the manage secret in the conversation or on the viewed page.
- Treat Slack (or any other chat) posting as a feature of this product.
  Giving the view URL to someone is **your** job.
- Open the file on their computer, copy it onto their disk, attach the
  HTML in chat, or screenshot a local browser tab *instead of* publishing.
  Those are not the meat sack share.
`;
