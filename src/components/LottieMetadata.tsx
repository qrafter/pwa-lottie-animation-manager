import type { Animation } from "@lottiefiles/lottie-types";

interface LottieMetadataProps {
  animationData: Animation;
}

const LottieMetadata = ({ animationData }: LottieMetadataProps) => {
  const metadata = [
    { label: "Name", value: animationData.nm || "N/A" },
    { label: "Lottie Version", value: animationData.v || "N/A" },
    { label: "Frame Rate", value: animationData.fr || "N/A" },
    { label: "Width", value: animationData.w || "N/A" },
    { label: "Height", value: animationData.h || "N/A" },
    { label: "In Point", value: animationData.ip || "N/A" },
    { label: "Out Point", value: animationData.op || "N/A" },
    { label: "3D Layers", value: animationData.ddd === 1 ? "Yes" : "No" },
    { label: "Assets", value: animationData.assets?.length || 0 },
    { label: "Layers", value: animationData.layers?.length || 0 },
    { label: "Markers", value: animationData.markers?.length || 0 },
  ];

  if (animationData.meta) {
    metadata.push(
      { label: "Author", value: animationData.meta.a || "N/A" },
      { label: "Generator", value: animationData.meta.g || "N/A" },
      { label: "Theme Color", value: animationData.meta.tc || "N/A" },
      { label: "Description", value: animationData.meta.d || "N/A" }
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-white p-4 rounded-lg ">
        <table className="w-full">
          <tbody>
            {metadata.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                <td className="py-2 px-4 font-semibold">{item.label}</td>
                <td className="py-2 px-4">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LottieMetadata;
