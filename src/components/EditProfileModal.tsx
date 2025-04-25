import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function EditProfileModal({
  userData,
  onClose,
  onProfileUpdated,
}: {
  userData: {
    name: string;
    avatar_url: string;
    bio?: string;
    location?: string;
  };
  onClose: () => void;
  onProfileUpdated: () => void;
}) {
  const [name, setName] = useState(userData.name || "");
  const [location, setLocation] = useState(userData.location || "");
  const [bio, setBio] = useState(userData.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(userData.avatar_url || "");
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `avatars/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      alert("Image upload failed.");
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    setAvatarUrl(publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        location,
        bio,
        avatar_url: avatarUrl,
      })
      .eq("id", user.id);

    if (error) {
      alert("Failed to update profile.");
    } else {
      onProfileUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-[#633cff] rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">Edit Profile</h2>

        <div className="space-y-4">
          <div className="text-center">
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-24 h-24 rounded-full mx-auto mb-2 object-cover"
              />
            )}
            <input type="file" onChange={uploadAvatar} disabled={uploading} />
          </div>

          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Location</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Bio</label>
            <textarea
              className="w-full border p-2 rounded"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-black text-white py-2 rounded hover:bg-[#4e2fbf] transition"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
