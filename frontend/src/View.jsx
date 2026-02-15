import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./api";

export default function View() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/content/${id}`);
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 403) {
            setError("View limit reached");
        } else if (err.response?.status === 410) {
            setError("Link expired");
        } else {
            setError("Invalid link");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen min-w-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-gray-400 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen min-w-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-red-400 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500 p-6 rounded-3xl text-center text-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center px-4">
      <div className="relative w-full max-w-2xl">

        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20"></div>

        <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700 p-8 rounded-3xl shadow-2xl space-y-6">

          <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Secure Content
          </h1>
          <p className="text-sm text-gray-400">
            Views left: {data.maxViews - data.views} / {data.maxViews}
          </p>

          {data.text && (
            <div className="space-y-2">
                <pre className="bg-gray-800 p-4 rounded overflow-x-auto">
                    {data.text}
                </pre>

                <button
                    onClick={() => {
                    navigator.clipboard.writeText(data.text);
                    alert("Text copied!");
                    }}
                    className="bg-green-600 px-3 py-1 rounded"
                >
                    Copy Text
                </button>

                </div>
          )}

          {data.filePath && (
            <a
            // href={`http://localhost:5000/${data.filePath}`}
            href={`http://localhost:5000/api/download/${id}`}
            download
            className="block text-center w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-xl font-semibold text-white shadow-lg"
            >
            Download {data.fileName}
            </a>

          )}

        </div>
      </div>
    </div>
  );
}
