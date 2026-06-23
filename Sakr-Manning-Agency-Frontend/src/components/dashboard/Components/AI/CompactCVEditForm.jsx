import React, { useState, useEffect } from "react";

const InputField = ({ label, value, onChange, type = "text", scale, t }) => (
  <div style={{ marginBottom: `${Math.round(12 * scale)}px`, width: "100%" }}>
    <label
      style={{
        display: "block",
        fontSize: `${Math.round(12 * scale)}px`,
        color: t?.textMuted || "#64748B",
        marginBottom: `${Math.round(4 * scale)}px`,
        fontWeight: 500,
        textTransform: "capitalize",
      }}
    >
      {label.replace(/_/g, " ")}
    </label>
    {type === "textarea" ? (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: `${Math.round(8 * scale)}px ${Math.round(12 * scale)}px`,
          borderRadius: `${Math.round(8 * scale)}px`,
          border: `1px solid ${t?.cardBorder || "#E2E8F0"}`,
          backgroundColor: t?.isDarkMode ? "rgba(255,255,255,0.05)" : "#F8FAFC",
          color: t?.text || "#1E293B",
          fontSize: `${Math.round(14 * scale)}px`,
          outline: "none",
          minHeight: `${Math.round(60 * scale)}px`,
          resize: "vertical",
          fontFamily: "inherit"
        }}
      />
    ) : (
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(type === "checkbox" ? e.target.checked : e.target.value)}
        style={{
          width: "100%",
          padding: `${Math.round(8 * scale)}px ${Math.round(12 * scale)}px`,
          borderRadius: `${Math.round(8 * scale)}px`,
          border: `1px solid ${t?.cardBorder || "#E2E8F0"}`,
          backgroundColor: t?.isDarkMode ? "rgba(255,255,255,0.05)" : "#F8FAFC",
          color: t?.text || "#1E293B",
          fontSize: `${Math.round(14 * scale)}px`,
          outline: "none"
        }}
      />
    )}
  </div>
);

const JsonNodeEditor = ({ nodeKey, data, onChange, scale, t, depth = 0 }) => {
  const isObject = typeof data === "object" && data !== null && !Array.isArray(data);
  const isArray = Array.isArray(data);

  if (isArray) {
    return (
      <div
        style={{
          marginBottom: `${Math.round(16 * scale)}px`,
          width: "100%"
        }}
      >
        {nodeKey && (
          <h4
            style={{
              fontSize: `${Math.round(14 * scale)}px`,
              color: t?.text || "#1E293B",
              marginBottom: `${Math.round(8 * scale)}px`,
              marginTop: 0,
              textTransform: "capitalize",
            }}
          >
            {nodeKey.replace(/_/g, " ").replace(/^\d+_/, "")}
          </h4>
        )}
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              padding: `${Math.round(12 * scale)}px`,
              backgroundColor: t?.inputBg || (t?.isDarkMode ? "rgba(0,0,0,0.2)" : "#fff"),
              border: `1px solid ${t?.cardBorder || "#E2E8F0"}`,
              borderRadius: `${Math.round(8 * scale)}px`,
              marginBottom: `${Math.round(8 * scale)}px`,
              position: "relative"
            }}
          >
            <div style={{ position: "absolute", top: 8, right: 8 }}>
              <button
                onClick={() => {
                  const newData = [...data];
                  newData.splice(index, 1);
                  onChange(newData);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontSize: `${Math.round(18 * scale)}px`
                }}
                title="Remove Item"
              >
                &times;
              </button>
            </div>
            <JsonNodeEditor
              nodeKey={`${nodeKey} Item ${index + 1}`}
              data={item}
              onChange={(newVal) => {
                const newData = [...data];
                newData[index] = newVal;
                onChange(newData);
              }}
              scale={scale}
              t={t}
              depth={depth + 1}
            />
          </div>
        ))}
        <button
          onClick={() => {
            // Try to guess empty structure based on first item, or just empty object
            const emptyItem = data.length > 0 && typeof data[0] === "object" && data[0] !== null
              ? Object.keys(data[0]).reduce((acc, k) => ({...acc, [k]: ""}), {})
              : "";
            onChange([...data, emptyItem]);
          }}
          style={{
            padding: `${Math.round(6 * scale)}px ${Math.round(12 * scale)}px`,
            backgroundColor: "transparent",
            color: t?.accentColor || "#00f2fe",
            border: `1px solid ${t?.accentColor || "#00f2fe"}`,
            borderRadius: `${Math.round(6 * scale)}px`,
            cursor: "pointer",
            fontSize: `${Math.round(12 * scale)}px`,
            fontWeight: 500
          }}
        >
          + Add {nodeKey ? nodeKey.replace(/_/g, " ").replace(/^\d+_/, "") : "Item"}
        </button>
      </div>
    );
  }

  if (isObject) {
    return (
      <div
        style={{
          borderLeft: depth > 0 ? `2px solid ${t?.accentColor || "#00f2fe"}` : "none",
          paddingLeft: depth > 0 ? `${Math.round(16 * scale)}px` : "0",
          marginBottom: `${Math.round(16 * scale)}px`,
          width: "100%"
        }}
      >
        {depth > 0 && nodeKey && (
          <h4
            style={{
              fontSize: `${Math.round(14 * scale)}px`,
              color: t?.text || "#1E293B",
              marginBottom: `${Math.round(12 * scale)}px`,
              marginTop: 0,
              textTransform: "capitalize",
              borderBottom: `1px solid ${t?.cardBorder || "#E2E8F0"}`,
              paddingBottom: `${Math.round(4 * scale)}px`
            }}
          >
            {nodeKey.replace(/_/g, " ").replace(/^\d+_/, "")}
          </h4>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: depth === 0 ? "1fr" : "repeat(auto-fill, minmax(200px, 1fr))",
            gap: `${Math.round(12 * scale)}px`,
            width: "100%"
          }}
        >
          {Object.keys(data).map((key) => {
            const childData = data[key];
            const childIsObj = typeof childData === "object" && childData !== null;
            return (
              <div key={key} style={{ gridColumn: childIsObj ? "1 / -1" : "auto" }}>
                <JsonNodeEditor
                  nodeKey={key}
                  data={childData}
                  onChange={(newVal) => onChange({ ...data, [key]: newVal })}
                  scale={scale}
                  t={t}
                  depth={depth + 1}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Scalar values
  return (
    <InputField
      label={nodeKey || "Value"}
      value={data}
      onChange={onChange}
      type={typeof data === "boolean" ? "checkbox" : typeof data === "number" ? "number" : String(data).length > 50 ? "textarea" : "text"}
      scale={scale}
      t={t}
    />
  );
};

export default function CompactCVEditForm({ data, onChange, scale = 1, isDarkMode = false }) {
  const t = {
    isDarkMode,
    text: isDarkMode ? "#F1F5F9" : "#1E293B",
    textMuted: isDarkMode ? "#94A3B8" : "#64748B",
    cardBorder: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
    accentColor: "#00f2fe",
    bg: isDarkMode ? "#0B0F19" : "#F8FAFC",
    inputBg: isDarkMode ? "rgba(15, 23, 42, 0.6)" : "#ffffff"
  };

  return (
    <div
      style={{
        width: "100%",
        maxHeight: `${Math.round(500 * scale)}px`,
        overflowY: "auto",
        padding: `${Math.round(16 * scale)}px`,
        backgroundColor: t.bg,
        borderRadius: `${Math.round(12 * scale)}px`,
        border: `1px solid ${t.cardBorder}`,
        boxShadow: isDarkMode ? "inset 0 2px 10px rgba(0,0,0,0.5)" : "none",
        boxSizing: "border-box"
      }}
    >
      <JsonNodeEditor
        nodeKey=""
        data={data || {}}
        onChange={onChange}
        scale={scale}
        t={t}
      />
    </div>
  );
}
