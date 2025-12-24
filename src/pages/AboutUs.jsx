// src/pages/AboutUs.jsx
import React from "react";

export default function AboutUs() {
    return (
        <div className="w-full py-10 animate-fade-in px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">About Us</h1>

            <div className="max-w-4xl mx-auto mt-8">
                <div className="relative" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                        src="https://www.youtube.com/embed/GTniQck-v9c"
                        title="Carrie: Transforming Lives One Search at a Time!"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    ></iframe>
                </div>

                <br />
                <br />
                <div className="mt-12 text-left">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-3">Meet Carrie: Empowering People, Fueling Change</h2>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                        Carrie isn't just smarter search and writing—it's real-world impact. Every subscription directly funds Essential
                        Families, a Missouri 501(c)(3) redefining opportunity for American families through the Economic Mobility
                        Program.
                    </p>
                    <h2 className="text-3xl font-semibold text-gray-800 mb-3">Essential Families:- Redefining Economic Mobility</h2>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                        Leveraging the Urban Institute Upward Mobility Framework, Essential Families operates with Amazon-like
                        innovation—shattering barriers and directly connecting vital resources to urban and rural communities.
                    </p>
                    <h2 className="text-3xl font-semibold text-gray-800 mb-3">The Impact is Real</h2>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                        Essential Families has served over 995 households, with 1,800+ families on the waitlist—demonstrating critical
                        demand for digital equity and economic mobility across Missouri and Kansas.
                    </p>
                    <h2 className="text-3xl font-semibold text-gray-800 mb-3">The Essential Economic Mobility Program</h2>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                        The program delivers digital tools, skills training, and continuous support for economic stability and upward
                        mobility:
                    </p>
                    <ul className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li>Free Chromebooks and no-cost broadband</li>
                        <li>Digital skills coaching and 24/7 telehealth support</li>
                        <li>Training for high-paying remote work and entrepreneurship</li>
                        <li>Emergency resources and pathways to opportunity</li>
                    </ul>
                    <h2 className="text-3xl font-semibold text-gray-800 mb-3">Proven Results:</h2>
                    <ul className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li>Nearly 1,000 families transformed with measurable change</li>
                        <li>&lt;300%+ ROI in public savings and outcomes</li>
                        <li>Measured by 24 predictors across 26 upward mobility metrics</li>
                    </ul>

                    <blockquote className="border-l-4 border-teal-700 pl-4 py-2 mb-6">
                        <p className="text-xl text-gray-800 leading-relaxed">
                            “We're giving underserved families the ACCESS to transform their lives and thrive in the digital economy.”
                        </p>
                        <footer className="text-lg font-medium text-gray-600 mt-2">— Terri English-Yancy, <span className="text-xs">BA, MA,
                            MA</span><br />Founder and CEO</footer>
                    </blockquote>
                    <h2 className="text-3xl font-semibold text-gray-800 mb-3">Why Choose Carrie?</h2>
                    <ul className="list-disc list-inside text-lg text-gray-700 leading-relaxed mb-4 space-y-2">
                        <li>Instant, accurate search</li>
                        <li>Clear, personalized answers</li>
                        <li>Professional writing assistance</li>
                        <li>Seamless Canva and CRM integration</li>
                        <li>Enterprise-grade security</li>
                        <li>Every $20/month subscription transforms families' lives</li>
                    </ul>
                    <h2 className="text-3xl font-semibold text-gray-800 mb-3">Join Carrie Today</h2>
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                        Search sharper, ask smarter, write with authority—and fuel lasting change. With 1,800+ families waiting, your
                        subscription makes an immediate difference.
                    </p>

                    Choose Carrie. Drive a future where lack of economic mobility never limits opportunity.[6]
                    <p align="center">
                        <br />
                        <b>
                            [Sign Up Now — Only $20/month]</b>
                    </p>
                    Be the change. Help uplift communities nationwide.
                </div>
            </div>
        </div>
    );
}
