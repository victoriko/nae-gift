import type { Metadata } from "next";

export const getMetadata = ({
  title,
  description,
  imageRelativePath = "/thumbnail.jpg",
}: {
  title: string;
  description: string;
  imageRelativePath?: string;
}): Metadata => {
  // Use NEXT_PUBLIC_API_URL as the base URL, with a fallback to localhost for development
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`;

  // Ensure the image URL is formed correctly, relative to the base URL
  const imageUrl = `${baseUrl}${imageRelativePath.startsWith("/") ? "" : "/"}${imageRelativePath}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl, // Use the fully formed image URL here
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [imageUrl], // And here
    },
  };
};
