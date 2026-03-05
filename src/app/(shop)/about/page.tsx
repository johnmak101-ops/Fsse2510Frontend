/**
 * @file Brand Story Page
 * @module app/(shop)/about/page
 * 
 * focuses on brand narrative and "Gelato Pique" philosophy.
 * utilizes static metadata for improved SEO discoverability.
 */

import Image from "next/image";
import { Metadata } from "next";

/** metadata for brand storytelling. */
export const metadata: Metadata = {
    title: "Our Story",
    description: "Discover the story behind Gelato Pique - wearable dessert for your room wear.",
};

/** 
 * static informational page. 
 * renders the brand narrative using responsive imagery and tailored typography.
 */
export default function AboutPage() {
    return (
        <section className="container mx-auto px-4 pt-24 md:pt-32 pb-16 md:pb-24">
            {/* Hero Image */}
            <div className="relative aspect-video md:aspect-21/9 w-full mb-12 overflow-hidden rounded-2xl">
                <Image
                    src="/images/background/story.jpg"
                    alt="Gelato Pique Story - Sweet Indulgences"
                    fill
                    priority
                    className="object-cover"
                    sizes="100vw"
                />
            </div>

            {/* Story Content */}
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-brand-text">
                        OUR STORY
                    </h1>
                    <h2 className="font-serif text-4xl md:text-5xl text-brand-text/70">
                        gelato pique is...
                    </h2>
                </div>

                {/* Body Text */}
                <div className="space-y-6 text-brand-text/80 leading-relaxed">
                    <p>
                        Inspired by sweet indulgences, Japanese-designed Gelato Pique roomwear is &quot;wearable dessert&quot; for young and mature adults. Gelato Pique collections are comprised of comfortable separates, matching sets, and coordinating accessories, all made in the brand&apos;s signature, comfortable gelato&apos; fabric.
                    </p>
                    <p>
                        Available in both women&apos;s and men&apos;s styles, and at a relatively affordable price point, Gelato Pique&apos;s cozy, casual-wear pieces are meant to provide a homey, tranquil lifestyle. With Gelato Pique, you can have your sweets, and wear them too.
                    </p>
                </div>
            </div>
        </section>
    );
}
