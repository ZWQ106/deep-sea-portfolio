import { Cloud } from "@react-three/drei";

export default function SkyClouds() {
  // 🎨 定义一个温暖的日出云朵色：淡金橙色
  // 不要在这里用纯白，会被环境光染脏
  const cloudColor = "#ffd6a5"; 

  return (
    <group position={[0, 15, -35]}> 
      {/* ☁️ 主云团 */}
      <Cloud
        position={[-10, 2, 0]}
        opacity={1.0}    // 拉满不透明度，让它更实
        speed={0.2}
        width={20}
        depth={5}
        segments={20}
        color={cloudColor} // 应用暖色
      />

      {/* ☁️ 副云团 1 */}
      <Cloud
        position={[15, -2, -5]}
        opacity={0.9}    // 稍微提高一点
        speed={0.15}
        width={15}
        depth={3}
        segments={15}
        color={cloudColor} // 应用暖色
      />

       {/* ☁️ 副云团 2 (稍微远一点，可以淡一点，带点紫调) */}
       <Cloud
        position={[0, 5, 5]}
        opacity={0.7}
        speed={0.3}
        width={10}
        color="#e0c3fc" // 试着给远处的云一点紫色的阴影感
      />
    </group>
  );
}