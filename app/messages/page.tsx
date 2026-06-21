"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Listing = {
  id: string;
  title: string;
  price: number;
  status: string;
  listing_images:
    | {
        image_url: string;
        sort_order: number;
      }[]
    | null;
};

type Conversation = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  listings: Listing | null;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

export default function MessagesPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [pageMessage, setPageMessage] = useState("");

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  async function loadConversations() {
    setLoading(true);
    setPageMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    setCurrentUserId(user.id);

    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        *,
        listings(
          id,
          title,
          price,
          status,
          listing_images(image_url, sort_order)
        )
      `
      )
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (error) {
      setPageMessage("Konuşmalar yüklenemedi: " + error.message);
      setLoading(false);
      return;
    }

    const conversationData: Conversation[] = (data ?? []).map((item: any) => ({
      ...item,
      listings: Array.isArray(item.listings)
        ? item.listings[0] ?? null
        : item.listings ?? null,
    }));

    setConversations(conversationData);

    if (conversationData.length > 0) {
      setSelectedConversationId(conversationData[0].id);
    }

    setLoading(false);
  }

  async function loadMessages(conversationId: string) {
    if (!currentUserId) return;

    setMessageLoading(true);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      setPageMessage("Mesajlar yüklenemedi: " + error.message);
      setMessageLoading(false);
      return;
    }

    const messageData = (data ?? []) as Message[];
    setMessages(messageData);

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("receiver_id", currentUserId)
      .eq("is_read", false);

    window.dispatchEvent(new Event("unread-messages-updated"));

    setMessageLoading(false);
  }

  async function sendMessage() {
    if (!currentUserId || !selectedConversation) return;

    const cleanMessage = messageText.trim();

    if (!cleanMessage) return;

    setSending(true);
    setPageMessage("");

    const receiverId =
      selectedConversation.buyer_id === currentUserId
        ? selectedConversation.seller_id
        : selectedConversation.buyer_id;

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversation.id,
      sender_id: currentUserId,
      receiver_id: receiverId,
      body: cleanMessage,
      is_read: false,
    });

    if (error) {
      setPageMessage("Mesaj gönderilemedi: " + error.message);
      setSending(false);
      return;
    }

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", selectedConversation.id);

    setMessageText("");

    await loadMessages(selectedConversation.id);
    await loadConversations();

    setSelectedConversationId(selectedConversation.id);

    window.dispatchEvent(new Event("unread-messages-updated"));

    setSending(false);
  }

  function handleMessageKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (!sending && messageText.trim()) {
        sendMessage();
      }
    }
  }

  const selectedConversation = useMemo(() => {
    return (
      conversations.find(
        (conversation) => conversation.id === selectedConversationId
      ) ?? null
    );
  }, [conversations, selectedConversationId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-7xl">
          <p className="text-neutral-400">Mesajlar yükleniyor...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:p-8">
          <p className="text-sm text-neutral-500">elFormazione</p>

          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
            Mesajlar
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400 md:text-base">
            Satıcılar ve alıcılarla ilan bazlı konuşmalarını buradan takip
            edebilirsin.
          </p>
        </div>

        {pageMessage && (
          <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
            {pageMessage}
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
            <h2 className="text-2xl font-bold">Henüz mesaj yok</h2>

            <p className="mt-3 text-neutral-400">
              Bir ilana mesaj gönderdiğinde veya bir kullanıcı senin ilanına
              mesaj attığında konuşmalar burada görünecek.
            </p>

            <Link
              href="/listings"
              className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200"
            >
              İlanları Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid min-h-[650px] overflow-hidden rounded-[2rem] border border-neutral-800 bg-neutral-900 lg:grid-cols-[360px_1fr]">
            <aside className="border-b border-neutral-800 lg:border-b-0 lg:border-r">
              <div className="border-b border-neutral-800 p-4">
                <h2 className="font-bold">Konuşmalar</h2>
                <p className="mt-1 text-xs text-neutral-500">
                  {conversations.length} konuşma
                </p>
              </div>

              <div className="max-h-[640px] overflow-y-auto">
                {conversations.map((conversation) => {
                  const listing = conversation.listings;
                  const coverImage = getCoverImage(listing);
                  const isSelected = selectedConversationId === conversation.id;
                  const otherUserRole =
                    conversation.buyer_id === currentUserId
                      ? "Satıcı"
                      : "Alıcı";

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full border-b border-neutral-800 p-4 text-left transition ${
                        isSelected
                          ? "bg-neutral-800"
                          : "bg-neutral-900 hover:bg-neutral-800/60"
                      }`}
                    >
                      <div className="grid grid-cols-[64px_1fr] gap-3">
                        <div className="h-16 overflow-hidden rounded-2xl bg-neutral-950">
                          {coverImage ? (
                            <img
                              src={coverImage}
                              alt={listing?.title ?? "İlan"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-neutral-600">
                              Yok
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">
                            {listing?.title ?? "İlan bulunamadı"}
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {otherUserRole} ile konuşma
                          </p>

                          <p className="mt-1 text-xs text-neutral-600">
                            {formatDate(conversation.updated_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="flex min-h-[650px] flex-col">
              {selectedConversation ? (
                <>
                  <div className="border-b border-neutral-800 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="font-bold">
                          {selectedConversation.listings?.title ??
                            "İlan bulunamadı"}
                        </h2>

                        <p className="mt-1 text-xs text-neutral-500">
                          {selectedConversation.listings?.status
                            ? statusText(selectedConversation.listings.status)
                            : "Durum yok"}
                        </p>
                      </div>

                      {selectedConversation.listings && (
                        <Link
                          href={`/listings/${selectedConversation.listings.id}`}
                          className="rounded-full border border-neutral-700 px-4 py-2 text-center text-sm hover:bg-neutral-800"
                        >
                          İlanı Gör
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {messageLoading ? (
                      <p className="text-neutral-500">Mesajlar yükleniyor...</p>
                    ) : messages.length === 0 ? (
                      <p className="text-neutral-500">
                        Bu konuşmada henüz mesaj yok.
                      </p>
                    ) : (
                      messages.map((message) => {
                        const isMine = message.sender_id === currentUserId;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-6 ${
                                isMine
                                  ? "bg-white text-black"
                                  : "bg-neutral-800 text-white"
                              }`}
                            >
                              <p className="whitespace-pre-line">
                                {message.body}
                              </p>

                              <p
                                className={`mt-2 text-[11px] ${
                                  isMine ? "text-black/50" : "text-neutral-500"
                                }`}
                              >
                                {formatDate(message.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="border-t border-neutral-800 p-4">
                    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-3">
                      <textarea
                        value={messageText}
                        onChange={(event) => setMessageText(event.target.value)}
                        onKeyDown={handleMessageKeyDown}
                        placeholder="Mesaj yaz... Enter gönderir, Shift + Enter alt satıra geçer."
                        className="min-h-24 w-full resize-none bg-transparent p-2 text-sm outline-none placeholder:text-neutral-600"
                      />

                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-neutral-600">
                          Enter: gönder · Shift + Enter: alt satır
                        </p>

                        <button
                          onClick={sendMessage}
                          disabled={sending || !messageText.trim()}
                          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-neutral-200 disabled:opacity-50"
                        >
                          {sending ? "Gönderiliyor..." : "Gönder"}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-8 text-center text-neutral-500">
                  Konuşma seç.
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function getCoverImage(listing: Listing | null) {
  const images = listing?.listing_images ?? [];

  if (images.length === 0) return null;

  const sortedImages = [...images].sort(
    (first, second) => first.sort_order - second.sort_order
  );

  return sortedImages[0]?.image_url ?? null;
}

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusText(status: string) {
  if (status === "active") return "Yayında";
  if (status === "pending") return "Onay bekliyor";
  if (status === "sold") return "Satıldı";
  if (status === "removed") return "Yayından kaldırıldı";
  if (status === "needs_revision") return "Düzenleme gerekli";
  if (status === "rejected") return "Reddedildi";
  return status;
}