import { Router } from "express";
import axios from "axios";
import { createRateLimiter } from "../utils/rate-limiter";

const router = Router();

// Utility function to extract metadata
const fetchMetadata = async (url: string) => {
  try {
    const response = await axios.get(url);
    const html = response.data;

    // Basic parsing for title, description, and image
    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    const descriptionMatch = html.match(
      /<meta name="description" content="([^"]*)"/
    );
    const imageMatch = html.match(
      /<meta property="og:image" content="([^"]*)"/
    );

    return {
      url,
      title: titleMatch ? titleMatch[1] : "No title found",
      description: descriptionMatch
        ? descriptionMatch[1]
        : "No description found",
      image: imageMatch ? imageMatch[1] : "No image found",
    };
  } catch (error) {
    return { url, error: "Failed to fetch metadata" };
  }
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const metadataRateLimiter = createRateLimiter(5, 1000);

// Define the route to handle metadata fetching
router.post("/", metadataRateLimiter, async (req, res) => {
  const urls: string[] = req.body.urls;

  if (!urls || !Array.isArray(urls)) {
    return res
      .status(400)
      .json({ error: "Invalid input, expected an array of URLs." });
  }

  const metadataPromises = urls.map(async (url) => {
    if (!isValidUrl(url)) {
      return { url, error: "Invalid URL format" };
    }
    return await fetchMetadata(url);
  });

  const results = await Promise.all(metadataPromises);
  res.json(results);
});

export default router;
