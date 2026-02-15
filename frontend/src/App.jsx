import { useState } from "react";
import api from "./api";

export default function App() {

  const [mode, setMode] = useState("text"); // text | file

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const [expiry, setExpiry] = useState(10);
  const [maxViews, setMaxViews] = useState(1);

  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLink("");
    setLoading(true);

    if (mode === "text" && !text.trim()) {
      setError("Please enter text");
      setLoading(false);
      return;
    }

    if (mode === "file" && !file) {
      setError("Please select a file");
      setLoading(false);
      return;
    }

    const form = new FormData();

    if (mode === "text") {
      form.append("text", text);
    }

    if (mode === "file") {
      form.append("file", file);
    }

    form.append("expiryMinutes", expiry);
    form.append("maxViews", maxViews);

    try {
      const res = await api.post("/upload", form);
      setLink(res.data.link);

      setText("");
      setFile(null);

    } catch (err) {
      setError(err.response?.data?.msg || "Upload failed");
    }

    setLoading(false);
  };

return (
  <div className="min-h-screen min-w-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center px-4">

    <div className="relative w-full max-w-lg">

      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20"></div>

      <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700 p-8 rounded-3xl shadow-2xl space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            LinkVault 🔐
          </h1>
          <p className="text-gray-400 text-sm">
            Securely share text or files with auto-expiry
          </p>
        </div>

        {/* Mode Switch */}
        <div className="relative flex bg-gray-800 p-1 rounded-xl">
          {["text", "file"].map((m) => {
            const active = mode === m;

            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg font-medium transition-all duration-300 ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl ring-2 ring-blue-400 scale-105"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                {m === "text" ? "Text" : "File"}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {mode === "text" && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your secret text..."
              className="w-full h-32 p-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
            />
          )}

          {mode === "file" && (
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 transition">
              <span className="text-gray-400 text-sm">
                {file ? file.name : "Click to upload file"}
              </span>
              <input
                type="file"
                hidden
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
          )}

          {/* Expiry + Views */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400">
                Expiry (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400">
                Max Views
              </label>
              <input
                type="number"
                min="1"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 py-3 rounded-xl font-semibold disabled:opacity-50 shadow-lg"
          >
            {loading ? "Generating Secure Link..." : "Generate Secure Link"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result */}
        {link && (
          <div className="bg-green-500/10 border border-green-500 p-4 rounded-xl space-y-3 animate-fadeIn">
            <p className="text-sm break-all text-green-400">
              {link}
            </p>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(link)}
              className="w-full bg-green-600 hover:bg-green-700 transition py-2 rounded-lg font-medium"
            >
              Copy Link
            </button>
          </div>
        )}

      </div>
    </div>
  </div>
);

}