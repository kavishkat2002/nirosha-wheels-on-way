
import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export function BusLoader({ className = "h-32 w-32" }: { className?: string }) {
    const [animationData, setAnimationData] = useState<any>(null);

    useEffect(() => {
        fetch("/images/Bus_carga_trackMile.json")
            .then((res) => res.json())
            .then((data) => setAnimationData(data))
            .catch((err) => console.error("Failed to load Lottie animation:", err));
    }, []);

    if (!animationData) {
        return <div className={className} />; // Placeholder while loading
    }

    return (
        <div className={className}>
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
}
