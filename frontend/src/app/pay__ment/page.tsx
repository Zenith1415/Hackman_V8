// Route handler for /pay__ment page
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.dismiss();
      setTimeout(() => toast.error("Please fill out all fields."), 10);
      return;
    }
    setIsSubmitting(true);
    const formPayload = new FormData();
    formPayload.append("name", formData.name);
    formPayload.append("email", formData.email);
    formPayload.append("message", formData.message);
    if (selectedFile) {
      formPayload.append("image", selectedFile);
    }
    const submitPromise = fetch("/api/payment", {
      method: "POST",
      body: formPayload,
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Something went wrong on the server.");
      }
      return response.json();
    });
    toast.promise(submitPromise, {
      loading: "Submitting payment data...",
      success: "Payment data submitted successfully!",
      error: "Failed to submit data. Please try again.",
    });
    try {
      await submitPromise;
      setFormData({ name: "", email: "", message: "" });
      setSelectedFile(null);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen flex flex-col bg-black text-white items-center justify-center py-10 px-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <Image
              src="/pay__mentt.jpg"
              alt="Payment"
              width={600}
              height={400}
              className="w-full h-auto rounded-lg"
              priority
            />
          </div>
          <div className="flex-1 max-w-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Team Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 bg-[#121212] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
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
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Upload Payment Proof Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-3 bg-[#121212] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-400">Selected: {selectedFile.name}</p>
                )}
              </div>
              {selectedFile && (
                <div className="w-full flex justify-center mt-2">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Payment Proof Preview"
                    className="max-h-40 rounded-lg border border-gray-700"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FE772D] text-gray-800 rounded-xl text-xl py-3 transform transition-all duration-300 hover:scale-105 hover:bg-[#E5691F] hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Payment"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}