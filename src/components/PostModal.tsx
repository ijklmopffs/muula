import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";

export default function PostModal({
  onClose,
  refetchPosts,
}: {
  onClose: () => void;
  refetchPosts: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tech");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setUploading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let imageUrl = "";

    if (image) {
      const filePath = `posts/${Date.now()}-${image.name}`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, image);

      if (uploadError) {
        toast.error("Image upload failed");
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      title,
      description,
      category,
      image_url: imageUrl,
    });

    if (error) {
      toast.error("Failed to create post");
    } else {
      toast.success("Post created!");
      refetchPosts(); // Trigger the refetch of posts
      onClose();
    }

    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Create Post
        </h2>

        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Tech">Tech</option>
          <option value="Business">Business</option>
          <option value="Lifestyle">Lifestyle</option>
        </select>

        <input
          type="file"
          className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          onChange={handleImageChange}
        />

        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Create Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
