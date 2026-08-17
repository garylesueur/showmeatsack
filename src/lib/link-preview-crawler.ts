const LINK_PREVIEW_CRAWLER =
  /(?:Slackbot|facebookexternalhit|Facebot|Twitterbot|Discordbot|TelegramBot|WhatsApp|LinkedInBot|Pinterestbot|Iframely|Embedly|vkShare|redditbot|Applebot-Image|SkypeUriPreview|Slack-ImgProxy)/i;

export function isLinkPreviewCrawler(userAgent: string | null): boolean {
  if (!userAgent) {
    return false;
  }
  return LINK_PREVIEW_CRAWLER.test(userAgent);
}
