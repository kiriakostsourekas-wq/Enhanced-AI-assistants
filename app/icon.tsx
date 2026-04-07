import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          borderRadius: 18,
          background: "#0E5B5E",
          color: "#F6F2E8",
          fontSize: 38,
          fontWeight: 800,
          fontFamily: "Arial, sans-serif",
          lineHeight: 1,
        }}
      >
        <span style={{ transform: "translateY(1px)" }}>N</span>
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#D97706",
          }}
        />
      </div>
    ),
    size,
  );
}
