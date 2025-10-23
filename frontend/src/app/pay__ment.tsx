"use client";
import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function Pay__ment() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.dismiss();
      setTimeout(() => toast.error("Please fill out all fields."), 10);
      return;
    }
    setIsSubmitting(true);
    const submitPromise = fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Something went wrong on the server.");
      }
      return response.json();
    });
    toast.promise(submitPromise, {
      loading: "Sending your message...",
      success: "Message sent successfully!",
      error: "Failed to send message. Please try again.",
    });
    try {
      await submitPromise;
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen flex flex-col bg-black text-white items-center justify-center py-10 px-4">
      <Image src="/skull.png" alt="Skull" width={220} height={220} className="mb-8" />
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 bg-[#121212] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email Id"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 bg-[#121212] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
        />
        <textarea
          name="message"
          placeholder="Message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className="w-full p-3 bg-[#121212] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500 resize-none"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#FE772D] text-gray-800 rounded-xl text-xl py-3 transform transition-all duration-300 hover:scale-105 hover:bg-[#E5691F] hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </section>
  );
}
