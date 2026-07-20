"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [pageMessage, setPageMessage] = useState("");
  const [pageMessageType, setPageMessageType] = useState<
    "info" | "success" | "error"
  >("info");

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversationId && currentUserId) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId, currentUserId]);

  useEffect(() => {
    scrollMessagesToBottom();
  }, [messages.length, selectedConversationId]);

  async function loadConversations(keepSelectedId?: string) {
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
      showPageMessage("Konuşmalar yüklenemedi: " + error.message, "error");
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

    await loadUnreadCounts(user.id, conversationData);

    if (conversationData.length > 0) {
      const stillExists = conversationData.some(
        (conversation) => conversation.id === keepSelectedId
      );

      if (keepSelectedId && stillExists) {
        setSelectedConversationId(keepSelectedId);
      } else {
        setSelectedConversationId(conversationData[0].id);
      }
    } else {
      setSelectedConversationId(null);
    }

    setLoading(false);
  }

  async function loadUnreadCounts(userId: string, conversationData: Conversation[]) {
    if (conversationData.length === 0) {
      setUnreadMap({});
      return;
    }

    const conversationIds = conversationData.map((conversation) => conversation.id);

    const { data } = await supabase
      .from("messages")
      .select("conversation_id")
      .in("conversation_id", conversationIds)
      .eq("receiver_id", userId)
      .eq("is_read", false);

    const nextUnreadMap: Record<string, number> = {};

    ((data ?? []) as { conversation_id: string }[]).forEach((message) => {
      nextUnreadMap[message.conversation_id] =
        (nextUnreadMap[message.conversation_id] ?? 0) + 1;
    });

    setUnreadMap(nextUnreadMap);
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
      showPageMessage("Mesajlar yüklenemedi: " + error.message, "error");
      setMessageLoading(false);
      return;
    }

    const messageData = (data ?? []) as Message[];
    setMessages(messageData);

    const unreadMessages = messageData.filter(
      (message) => message.receiver_id === currentUserId && !message.is_read
    );

    if (unreadMessages.length > 0) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .eq("receiver_id", currentUserId)
        .eq("is_read", false);

      setUnreadMap((currentMap) => ({
        ...currentMap,
        [conversationId]: 0,
      }));

      window.dispatchEvent(new Event("unread-messages-updated"));
    }

    setMessageLoading(false);
  }

  async function sendMessage() {
    if (!currentUserId || !selectedConversation) return;

    const cleanMessage = messageText.trim();

    if (!cleanMessage) return;

    if (cleanMessage.length > 1000) {
      showPageMessage("Mesaj en fazla 1000 karakter olabilir.", "error");
      return;
    }

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
      showPageMessage("Mesaj gönderilemedi: " + error.message, "error");
      setSending(false);
      return;
    }

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", selectedConversation.id);

    setMessageText("");

    await loadMessages(selectedConversation.id);
    await loadConversations(selectedConversation.id);

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

  function showPageMessage(
    nextMessage: string,
    nextType: "info" | "success" | "error" = "info"
  ) {
    setPageMessage(nextMessage);
    setPageMessageType(nextType);
  }

  function scrollMessagesToBottom() {
    window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 80);
  }

  const selectedConversation = useMemo(() => {
    return (
      conversations.find(
        (conversation) => conversation.id === selectedConversationId
      ) ?? null
    );
  }, [conversations, selectedConversationId]);

  const selectedConversationRole = useMemo(() => {
    if (!selectedConversation || !currentUserId) return "";

    return selectedConversation.buyer_id === currentUserId ? "Alıcı" : "Satıcı";
  }, [selectedConversation, currentUserId]);

  const totalUnreadCount = useMemo(() => {
    return Object.values(unreadMap).reduce((total, count) => total + count, 0);
  }, [unreadMap]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white md:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
            <p className="text-neutral-400">Mesajlar yükleniyor...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-white md:px-8 md:py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:rounded-[2.4rem] md:p-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-yellow-800 bg-yellow-950 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />

              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-yellow-300">
                Mesajlar
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">
              İlan konuşmaların.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 md:text-base">
              Alıcılar ve satıcılarla ilan bazlı konuşmalarını buradan takip
              et. Yeni mesajlar konuşma listesinde rozetle görünür.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/listings"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-black text-black hover:bg-neutral-200"
              >
                Marketi Keşfet
              </Link>

              <Link
                href="/profile"
                className="rounded-full border border-neutral-700 px-6 py-3 text-center text-sm font-black text-neutral-300 hover:bg-neutral-800"
              >
                Profilime Dön
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 md:rounded-[2.4rem]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
              Mesaj Özeti
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <StatCard label="Konuşma" value={String(conversations.length)} />
              <StatCard label="Okunmamış" value={String(totalUnreadCount)} />
            </div>

            <div className="mt-5 rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-sm font-black text-neutral-200">
                Güvenli iletişim
              </p>

              <p className="mt-2 text-xs leading-6 text-neutral-500">
                Ürün detaylarını, ek fotoğraf taleplerini ve teslimat
                görüşmelerini site içi mesajlaşmadan yürütmen daha güvenlidir.
              </p>
            </div>
          </div>
        </div>

        {pageMessage && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm font-semibold ${
              pageMessageType === "success"
                ? "border-emerald-800 bg-emerald-950 text-emerald-300"
                : pageMessageType === "error"
                  ? "border-red-900 bg-red-950 text-red-300"
                  : "border-neutral-800 bg-neutral-900 text-neutral-300"
            }`}
          >
            {pageMessage}
          </div>
        )}

        {conversations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid overflow-hidden rounded-[2rem] border border-neutral-800 bg-neutral-900 lg:min-h-[690px] lg:grid-cols-[370px_1fr]">
            <aside className="border-b border-neutral-800 lg:border-b-0 lg:border-r">
              <div className="border-b border-neutral-800 p-4">
                <h2 className="text-lg font-black">Konuşmalar</h2>

                <p className="mt-1 text-xs font-bold text-neutral-500">
                  {conversations.length} konuşma
                </p>
              </div>

              <div className="max-h-[360px] overflow-y-auto lg:max-h-[690px]">
                {conversations.map((conversation) => {
                  const listing = conversation.listings;
                  const coverImage = getCoverImage(listing);
                  const isSelected = selectedConversationId === conversation.id;
                  const otherUserRole =
                    conversation.buyer_id === currentUserId
                      ? "Satıcı"
                      : "Alıcı";
                  const unreadCount = unreadMap[conversation.id] ?? 0;

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
                              className={`h-full w-full object-cover ${
                                listing?.status === "sold" ||
                                listing?.status === "removed"
                                  ? "opacity-60 grayscale"
                                  : ""
                              }`}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-neutral-600">
                              Yok
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-black">
                              {listing?.title ?? "İlan bulunamadı"}
                            </p>

                            {unreadCount > 0 && (
                              <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-white px-2 text-xs font-black text-black">
                                {unreadCount}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs font-bold text-neutral-500">
                            {otherUserRole} ile konuşma
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            {listing?.status && (
                              <span className={statusClass(listing.status)}>
                                {statusText(listing.status)}
                              </span>
                            )}

                            <span className="text-[11px] font-medium text-neutral-600">
                              {formatDate(conversation.updated_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="flex min-h-[620px] flex-col lg:min-h-[690px]">
              {selectedConversation ? (
                <>
                  <div className="border-b border-neutral-800 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-600">
                          {selectedConversationRole} olarak konuşuyorsun
                        </p>

                        <h2 className="mt-1 truncate text-lg font-black md:text-xl">
                          {selectedConversation.listings?.title ??
                            "İlan bulunamadı"}
                        </h2>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {selectedConversation.listings?.status && (
                            <span
                              className={statusClass(
                                selectedConversation.listings.status
                              )}
                            >
                              {statusText(selectedConversation.listings.status)}
                            </span>
                          )}

                          {selectedConversation.listings?.price && (
                            <span className="rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 text-xs font-black text-neutral-300">
                              {Number(
                                selectedConversation.listings.price
                              ).toLocaleString("tr-TR")}
                              ₺
                            </span>
                          )}
                        </div>
                      </div>

                      {selectedConversation.listings && (
                        <Link
                          href={`/listings/${selectedConversation.listings.id}`}
                          className="rounded-full border border-neutral-700 px-4 py-2 text-center text-sm font-black text-neutral-300 hover:bg-neutral-800"
                        >
                          İlanı Gör
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-950/35 p-4">
                    {messageLoading ? (
                      <p className="text-neutral-500">Mesajlar yükleniyor...</p>
                    ) : messages.length === 0 ? (
                      <div className="flex h-full min-h-[260px] items-center justify-center text-center">
                        <div>
                          <h3 className="text-xl font-black">
                            Bu konuşmada henüz mesaj yok
                          </h3>

                          <p className="mt-2 text-sm text-neutral-500">
                            İlk mesajı yazarak konuşmayı başlatabilirsin.
                          </p>
                        </div>
                      </div>
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
                              className={`max-w-[86%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-lg md:max-w-[72%] ${
                                isMine
                                  ? "bg-white text-black"
                                  : "border border-neutral-800 bg-neutral-900 text-white"
                              }`}
                            >
                              <p className="whitespace-pre-line break-words">
                                {message.body}
                              </p>

                              <div
                                className={`mt-2 flex items-center justify-end gap-2 text-[11px] ${
                                  isMine ? "text-black/50" : "text-neutral-500"
                                }`}
                              >
                                <span>{formatDate(message.created_at)}</span>

                                {isMine && (
                                  <span>{message.is_read ? "Okundu" : "Gönderildi"}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  <div className="border-t border-neutral-800 p-4">
                    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-3">
                      <textarea
                        value={messageText}
                        onChange={(event) => setMessageText(event.target.value)}
                        onKeyDown={handleMessageKeyDown}
                        maxLength={1000}
                        placeholder="Mesaj yaz... Enter gönderir, Shift + Enter alt satıra geçer."
                        className="min-h-24 w-full resize-none bg-transparent p-2 text-sm leading-6 outline-none placeholder:text-neutral-600"
                      />

                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-neutral-600">
                          Enter: gönder · Shift + Enter: alt satır ·{" "}
                          {messageText.length}/1000
                        </p>

                        <button
                          onClick={sendMessage}
                          disabled={sending || !messageText.trim()}
                          className="rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-neutral-200 disabled:opacity-50"
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

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-8">
      <h2 className="text-3xl font-black">Henüz mesaj yok</h2>

      <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-400">
        Bir ilana mesaj gönderdiğinde veya bir kullanıcı senin ilanına mesaj
        attığında konuşmalar burada görünecek.
      </p>

      <Link
        href="/listings"
        className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-neutral-200"
      >
        İlanları Keşfet
      </Link>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
      <p className="text-3xl font-black">{value}</p>

      <p className="mt-1 text-xs font-bold text-neutral-500">{label}</p>
    </div>
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

function statusClass(status: string) {
  const baseClass =
    "rounded-full border px-3 py-1 text-[11px] font-black backdrop-blur";

  if (status === "active") {
    return `${baseClass} border-emerald-800 bg-emerald-950/90 text-emerald-300`;
  }

  if (status === "pending") {
    return `${baseClass} border-blue-800 bg-blue-950/90 text-blue-300`;
  }

  if (status === "sold") {
    return `${baseClass} border-purple-800 bg-purple-950/90 text-purple-300`;
  }

  if (status === "removed") {
    return `${baseClass} border-red-900 bg-red-950/90 text-red-300`;
  }

  if (status === "needs_revision") {
    return `${baseClass} border-yellow-800 bg-yellow-950/90 text-yellow-300`;
  }

  if (status === "rejected") {
    return `${baseClass} border-red-900 bg-red-950/90 text-red-300`;
  }

  return `${baseClass} border-neutral-800 bg-neutral-950/90 text-neutral-300`;
}