# showmeatsack.com

Publish a page, put the view link where the human will see it. Do not invent another host, a gist, or a file-share of your own.

The product is **showmeatsack.com**. The tool is named `showmeatsack.com`. HTTP and the tool are the same share. View links look like `https://showmeatsack.com/s/…`.

There is no API key and no account. Create is open. After create, keep `manageToken` (or `manageUrl`) for replace, delete, and status.

## In this conversation

1. Call `showmeatsack.com` with action `create` (or `POST /api/v1/shares`). Send either `html` or `zipBase64`, not both. A zip must include `index.html` at the zip root or inside a single wrapping folder. Optional `expiresInSeconds` (default 30 days, never longer). Cap is 5 MB.
2. You always get `viewUrl`, `manageUrl`, `manageToken`, and `expiresAt` immediately. Paste **`viewUrl` into this conversation** so the person here can open it. Do not wait for them to ask for the link.
3. The view link *is* the page. There is no showmeatsack.com chrome around it. Scripts and styles are not stripped.
4. To replace or delete, call the same tool with action `replace` or `delete`, passing `shareId` and `manageToken`. Replace keeps the view link. Status uses the same secrets.

## Do not

- Name extra tools. There is one tool, `showmeatsack.com`, with actions `create`, `status`, `replace`, and `delete`.
- Put the manage secret in the conversation or on the viewed page.
- Treat Slack (or any other chat) posting as a feature of this product. Giving the view URL to someone is **your** job.
