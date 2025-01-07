"use client";

import { Avatar, Image, Button, Textarea, useToast } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface Author {
  name: string;
  role: string;
  specialty?: ExpertSpecialty;
  image: string;
}

enum ExpertSpecialty {
  NUTRISI_ANAK,
  PSIKOLOGI_ANAK,
  PARENTING,
  PERTUMBUHAN_ANAK,
  EDUKASI_ANAK,
}

enum ExpertSpecialtyType {
  NUTRISI_ANAK = "NUTRISI_ANAK",
  PSIKOLOGI_ANAK = "PSIKOLOGI_ANAK",
  PARENTING = "PARENTING",
  PERTUMBUHAN_ANAK = "PERTUMBUHAN_ANAK",
  EDUKASI_ANAK = "EDUKASI_ANAK",
}

const expertSpecialtyLabel: Record<ExpertSpecialtyType, string> = {
  NUTRISI_ANAK: "Nutrisi Anak",
  PSIKOLOGI_ANAK: "Psikologi Anak",
  PARENTING: "Parenting",
  PERTUMBUHAN_ANAK: "Pertumbuhan Anak",
  EDUKASI_ANAK: "Pendidikan Anak",
};

interface Comment {
  id: number;
  content: string;
  author: Author;
  createdAt: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  image?: string;
  author: Author;
  createdAt: string;
  comments: Comment[];
}

interface PageParams {
  params: Promise<{ postId: string }>;
}

export default function NewsDetailWrapper({ params }: PageParams) {
  const resolvedParams = use(params);
  return <NewsDetailContent postId={resolvedParams.postId} />;
}

function NewsDetailContent({ postId }: { postId: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState("");
  const { data: session } = useSession();
  const toast = useToast();

  useEffect(() => {
    if (!postId) return;
    const fetchPost = async () => {
      const response = await fetch(`/api/posts/${postId}`);
      const data = await response.json();
      setPost(data);
    };
    fetchPost();
  }, [postId]);

  console.log(post);

  const handleCommentSubmit = async () => {
    if (!session) {
      toast({
        title: "Silakan masuk terlebih dahulu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setPost((prev) =>
          prev ? { ...prev, comments: [newComment, ...prev.comments] } : null
        );
        setComment("");
        toast({
          title: "Komentar berhasil ditambahkan",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast({
        title: "Gagal menambahkan komentar",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!post) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {post.image && (
          <div className="relative h-[400px] w-full overflow-hidden rounded-xl">
            <Image
              src={post.image}
              alt={post.title}
              objectFit="cover"
              width="100%"
              height="100%"
            />
          </div>
        )}

        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            {post.title}
          </h1>

          <div className="flex items-center space-x-4">
            <Avatar size="md" src={post.author.image} name={post.author.name} />
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">{post.author.name}</p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: id,
                })}
              </p>
            </div>
          </div>
        </div>

        <article className="prose prose-lg max-w-none">{post.content}</article>

        <hr className="border-t border-gray-200 my-12" />

        <div className="space-y-8">
          {session ? (
            <div className="space-y-4">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tulis komentar..."
                className="w-full rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500"
              />
              <Button
                onClick={handleCommentSubmit}
                className="ml-auto bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6 py-2"
              >
                Kirim Komentar
              </Button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-600">
                Silakan masuk terlebih dahulu untuk menambahkan komentar.
              </p>
            </div>
          )}

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Komentar ({post.comments.length})
            </h2>
            {post.comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white rounded-xl shadow-sm p-6 space-y-4"
              >
                <div className="flex items-center space-x-4">
                  <Avatar
                    size="sm"
                    src={comment.author.image}
                    name={comment.author.name}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-900">
                        {comment.author.name}
                      </p>
                      <span className="text-sm text-pink-500">
                        {comment.author.specialty
                          ? "Ahli " +
                            expertSpecialtyLabel[
                              comment.author
                                .specialty as unknown as ExpertSpecialtyType
                            ]
                          : "Pengguna"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
