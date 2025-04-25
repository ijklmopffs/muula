import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setName(data.name || "");
      setLocation(data.location || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url || "");
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload Error:", uploadError.message);
      toast.error("Upload failed.");
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    setAvatarUrl(publicUrl.publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      name,
      location,
      bio,
      avatar_url: avatarUrl,
    });

    if (error) {
      toast.error("Error saving profile");
    } else {
      toast.success("Profile updated!");
      navigate("/feed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4 bg-[#633cff]">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

      <div>
        <label className="block text-sm font-medium mb-1">Profile Photo</label>
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-24 h-24 rounded-full mb-2 mx-auto"
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
        className="bg-black text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Profile
      </button>
    </div>
  );
}
