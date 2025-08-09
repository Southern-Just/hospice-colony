"use client";
import { useState } from "react";
import { toast } from "sonner";

export default function Admission() {
    const [form, setForm] = useState({ name: "", condition: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/hospitals/admit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            toast.success(`Admitted to ${data.hospital.name}`);
        } catch (err) {
            toast.error(err.message || "Admission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-10">
            <h2 className="text-xl font-bold">Patient Admission</h2>

            <input
                type="text"
                name="name"
                placeholder="Patient Name"
                value={form.name}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
            />

            <input
                type="text"
                name="condition"
                placeholder="Condition"
                value={form.condition}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
            />

            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                {loading ? "Admitting..." : "Get Admitted"}
            </button>
        </form>
    );
}
