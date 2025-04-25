import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import PostModal from "../../components/PostModal";
import EditProfileModal from "../../components/EditProfileModal";
import { useNavigate } from "react-router-dom";

export default function Feed() {
  const [userData, setUserData] = useState<{
    name: string;
    avatar_url: string;
    location?: string;
    bio?: string;
  } | null>(null);

  const [posts, setPosts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<{
    name: string;
    avatar_url: string;
    bio: string;
    location: string;
  } | null>(null);

  const navigate = useNavigate();

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(
        "id, title, description, image_url, category, user_id, created_at"
      )
      .order("created_at", { ascending: false });

    if (!error && data) {
      const postsWithUserNames = await Promise.all(
        data.map(async (post) => {
          const { data: userData } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", post.user_id)
            .single();

          return {
            ...post,
            created_by: userData?.name || "Unknown",
          };
        })
      );
      setPosts(postsWithUserNames);
    } else {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchUserProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("name, avatar_url, location, bio")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setUserData(data);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchPosts();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPosts([]);
    navigate("/");
  };

  const handlePostClick = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("name, avatar_url, bio, location")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setSelectedUserProfile(data);
    } else {
      alert("Error fetching user profile.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-blue-600 hidden md:block">
          SkillPostr
        </h1>

        {userData && (
          <div className="flex items-center gap-3 mx-auto md:mx-0">
            <button
              onClick={() => setShowEditProfile(true)}
              className="flex items-center gap-2 hover:opacity-80 cursor-pointer"
            >
              <img
                src={userData.avatar_url}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover"
              />
              <span className="text-gray-700 font-medium">{userData.name}</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              + Add Post
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {showModal && (
        <PostModal
          onClose={() => setShowModal(false)}
          refetchPosts={fetchPosts}
        />
      )}

      {showEditProfile && userData && (
        <EditProfileModal
          userData={userData}
          onClose={() => setShowEditProfile(false)}
          onProfileUpdated={fetchUserProfile}
        />
      )}

      {selectedUserProfile && (
        <div className="fixed top-0 left-0 w-full h-full text-black bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <h2 className="text-lg font-semibold">
              Profile of {selectedUserProfile.name}
            </h2>
            <img
              src={selectedUserProfile.avatar_url}
              alt={selectedUserProfile.name}
              className="w-20 h-20 rounded-full object-cover mt-4 mx-auto"
            />
            <p className="mt-2">{selectedUserProfile.bio}</p>
            <p className="mt-2">Location: {selectedUserProfile.location}</p>
            <button
              onClick={() => setSelectedUserProfile(null)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="p-6">
        {posts.length === 0 ? (
          <p className="text-black">
            No posts available. Be the first to post!
          </p>
        ) : (
          <div className="space-y-4 flex items-center gap-4 flex-wrap">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-4 rounded shadow-md flex flex-col space-y-3 w-96 mx-auto md:mx-0"
              >
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-64 object-cover rounded"
                  />
                )}
                <h2 className="text-lg font-semibold text-black">
                  {post.title}
                </h2>
                <p className="text-black">{post.description}</p>
                <div className="text-sm text-gray-500">{post.category}</div>
                <div className="text-sm text-gray-500">
                  Created by {post.created_by}
                </div>
                <button
                  onClick={() => handlePostClick(post.user_id)}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
