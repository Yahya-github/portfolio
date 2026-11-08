import portrait from "@/assets/portrait-800.webp";
import { shortSha } from "@/lib/build-info";

export default function Home() {
  return (
    <main>
      <h1 style={{ fontStretch: "75%", fontWeight: 700 }}>YAHYA</h1>
      <p>Deploy pipeline test, Instrument Sans body text.</p>
      {/* eslint-disable-next-line @next/next/no-img-element -- export has no optimizer; asset is pre-sized */}
      <img
        src={portrait.src}
        width={portrait.width}
        height={portrait.height}
        alt="Yahya Hallani, greyscale portrait"
      />
      <p>
        <a href="/yahya-hallani-resume.pdf">Resume (PDF)</a>
      </p>
      <p>
        <small>{`build ${shortSha(process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA)}`}</small>
      </p>
    </main>
  );
}
