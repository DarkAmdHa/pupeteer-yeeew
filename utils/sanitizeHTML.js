export default function sanitizeHTML(html) {
  try {
    // Regular expression to extract hrefs from <a> tags
    const hrefRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gim;
    let hrefs = [];
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
      hrefs.push(match[1]);
    }

    // Create a string of hrefs separated by new lines
    const hrefsString = hrefs.join("\n") + "\n\n";

    // Regular expressions to remove various non-textual elements
    var cleanedContent = html
      .replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, "")
      .replace(/<style[^>]*>([\S\s]*?)<\/style>/gim, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gim, "")
      //    .replace(/<[^>]*>/g, '')
      .replace(/<(?!\/?a\s*[^>]*>)[^>]*>/g, "")
      .replace(/(<a [^>]*?)\sclass="[^"]*"(.*?>)/gi, "$1$2")
      .replace(/(onclick|onload)="[^"]*"/gim, "")
      .replace(/style="[^"]*"/gim, "")
      .replace(/\s+/g, " ")
      .trim();

    // Concatenate hrefs at the top of the cleaned content
    const finalContent = hrefsString + cleanedContent;

    return finalContent;
  } catch (e) {
    console.log(`Issue with URL ${url}: ${e.message}`.red);
    throw new Error(
      "Link " + url + " not valid or not reachable: " + e.message
    );
  }
}
