import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";
import { useAuth } from "../context/AuthContext";
import { timeLeft } from "../utils/utils";
import { fetchWithAuth } from "../api/fetchWithAuth";

export default function Pricing() {
  const { isAuthenticated, setIsPro } = useAuth()
  const { logoutAndNavigate } = useAuthUtils();
  const [btnTxt, setBtnTxt] = useState("Start Your 5-Day Free Trial")
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);

  useEffect(() => {
    async function getSubscriptionStatus() {
      const token = localStorage.getItem('authToken');

      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/subscriptions/get-subscription-status/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const resJson = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          showCustomToast("Session expired. Please log in again.", { type: "warn" });
          logoutAndNavigate()
        } else {
          showCustomToast(resJson, { type: "error" })
        }
      } else {
        if (resJson.had_trial) {
          if (resJson.is_trial_active) {
            setBtnTxt(`Free Trial Ends in ${timeLeft(resJson.trial_ends_at)}`)
          } else {
            setIsPro(!!resJson.is_active)
            if (resJson.is_active) {
              setBtnTxt("Subscription Active!")
              if (resJson.subscription_cancel_at) {
                // Convert ISO datetime → "00d : 00h : 00m" format

                const cancelAtMs = new Date(resJson.subscription_cancel_at).getTime();
                const nowMs = Date.now();

                let diffSeconds = Math.floor((cancelAtMs - nowMs) / 1000);

                // Safety check (already expired)
                if (diffSeconds < 0) diffSeconds = 0;

                const days = Math.floor(diffSeconds / (60 * 60 * 24));
                const hrs = Math.floor((diffSeconds % (60 * 60 * 24)) / (60 * 60));
                const mins = Math.floor((diffSeconds % (60 * 60)) / 60);

                const subscription_cancel_at =
                  `Subscription ends in ${days}d : ${hrs}h : ${mins}m`;

                // $('.cta-section .cta-button').text(subscription_cancel_at).css('cursor', 'default').off("click");
                setBtnTxt(subscription_cancel_at)
                // $('.cta-section .no-cc').html(
                //   'Undo cancellation in <a onclick="managePlan()" href="javascript:void(0)" style="display: inline-flex; align-items: center; gap: 4px; text-decoration: underline dotted; cursor: pointer;">' +
                //   'Manage Plan <i class="fa fa-external-link" aria-hidden="true"></i>' +
                //   '</a>'
                // );
              }
            } else {
              setBtnTxt("Subscribe Now")
            }
          }
        } else {
          setBtnTxt("Start Your 5-Day Free Trial")
        }
      }
      setIsSubscriptionLoading(false)
    }
    if (isAuthenticated) getSubscriptionStatus()
  }, [isAuthenticated])

  async function startFreeTrial() {
    const token = localStorage.getItem('authToken');
    const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/start-free-trial/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const resJson = await res.json()
    if (!res.ok) {
      if (res.status === 401) {
        showCustomToast("Session expired. Please log in again.", { type: "warn" });
        logoutAndNavigate()
      } else {
        showCustomToast(resJson, { type: "error" })
      }
    } else {
      showCustomToast(resJson, { type: "success" })
      var result = '6d : 23h : 59m'
      setBtnTxt('Free Trial Ends in ' + result)
    }
  }

  async function createCheckoutSession() {
    const token = localStorage.getItem('authToken');

    setIsRedirectingToPayment(true)

    const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/subscriptions/create-checkout-session/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const resJson = await res.json()

    if (!res.ok) {
      if (res.status === 401) {
        showCustomToast("Session expired. Please log in again.", { type: "warn" });
        logoutAndNavigate()
      } else {
        showCustomToast("Failed to initiate payment. Please try again.", { type: "error", title: "Error" });
        setIsRedirectingToPayment(false)
      }
    } else {
      if (resJson.checkout_url) {
        window.location.href = resJson.checkout_url;
      } else {
        showCustomToast("Could not get payment URL. Please try again.", { type: "error", title: "Payment Error" });
        setIsRedirectingToPayment(false)
      }
    }
  }

  async function handleManagePlanClick() {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/subscriptions/stripe-portal/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      })
      const resJson = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          showCustomToast("Session expired. Please log in again.", { type: "warn" });
          logoutAndNavigate()
        } else {
          showCustomToast(
            "Could not fetch Stripe Customer Portal URL. Please try again.",
            { type: "error", title: "Error fetching data" }
          )
        }
      } else {
        window.location.href = resJson.url;
      }
    } catch (err) {
      console.error(err);
      showCustomToast({ message: "Something went wrong" }, { type: "error" });
    } finally {

    }
  }


  return (
    <>
      <style>{`

        .container { max-width: 28rem; margin: 0 auto; margin-bottom: 3rem; }
        .pricing-card { background: white; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); overflow: hidden; border: 1px solid #e5e7eb; }
        .card-header { background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); padding: 2.5rem 2rem; text-align: center; color: white; }
        .card-header h2 { font-size: 1.875rem; font-weight: bold; margin-bottom: 0.5rem; }
        .card-header .subtitle { color: #bfdbfe; font-size: 0.875rem; margin-bottom: 1.5rem; }
        .price { margin-bottom: 1rem; }
        .price-amount { font-size: 3rem; font-weight: bold; }
        .price-period { font-size: 1.25rem; color: #bfdbfe; margin-left: 0.5rem; }
        .card-header .tagline { font-size: 0.875rem; color: #dbeafe; }
        .cta-section { padding: 1.5rem 2rem; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
        .cta-button { width: 100%; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: white; font-weight: 600; padding: 1rem; border-radius: 0.5rem; border: none; cursor: pointer; font-size: 1rem; margin-bottom: 0.75rem; transition: box-shadow 0.2s; }
        .cta-button:hover { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .no-cc { text-align: center; font-size: 0.875rem; color: #6b7280; }
        .features-section { padding: 1.5rem 2rem; border-bottom: 1px solid #e5e7eb; }
        .features-section h3 { font-weight: bold; color: #111827; margin-bottom: 1rem; }
        .feature-item { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; align-items: flex-start; }
        .check-icon { width: 1.25rem; height: 1.25rem; color: #16a34a; flex-shrink: 0; margin-top: 0.125rem; }
        .feature-text { font-size: 0.875rem; color: #374151; line-height: 1.5; }
        .impact-section { padding: 1.5rem 2rem; background: linear-gradient(135deg, #faf5ff 0%, #fce7f3 100%); }
        .impact-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
        .heart-icon { width: 1.25rem; height: 1.25rem; color: #9333ea; flex-shrink: 0; }
        .impact-header h3 { font-weight: bold; color: #111827; }
        .impact-description { font-size: 0.875rem; color: #374151; margin-bottom: 1rem; line-height: 1.5; }
        .impact-item { display: flex; gap: 0.5rem; margin-bottom: 0.625rem; align-items: flex-start; }
        .impact-icon { width: 1rem; height: 1rem; color: #9333ea; flex-shrink: 0; margin-top: 0.125rem; }
        .impact-text { font-size: 0.75rem; color: #374151; line-height: 1.5; }
        .stats-box { margin-top: 1rem; padding: 0.75rem; background: white; border-radius: 0.5rem; border: 1px solid #e9d5ff; text-align: center; }
        .stats-box p { font-size: 0.75rem; color: #6b7280; margin: 0; }
        .stats-highlight { font-weight: 600; color: #9333ea; }
        .footer-section { padding: 1.5rem 2rem; text-align: center; }
        .footer-section p { font-size: 0.75rem; color: #9ca3af; margin-bottom: 0.25rem; }
        .footer-section p:first-child { color: #6b7280; }
        .bottom-cta { margin-top: 1.5rem; text-align: center; }
        .bottom-text { font-size: 0.875rem; color: #6b7280; margin-bottom: 0.75rem; }
        .learn-more { color: #2563eb; font-weight: 500; font-size: 0.875rem; text-decoration: underline; cursor: pointer; background: none; border: none; padding: 0; }
        .learn-more:hover { color: #1d4ed8; }
      `}</style>


      {isAuthenticated ? (isSubscriptionLoading ? <div className="max-w-xl mx-auto py-10 animate-fade-in px-4 sm:px-6 lg:px-8 text-center">
        {/* {(!isAuthenticated || isSubscriptionLoading || isRedirectingToPayment) && */}
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Pricing</h1>
        {/* } */}
        <div id="pricing-status-container" className="mt-8"><p className="text-gray-600">Loading subscription status...</p></div></div> :
        isRedirectingToPayment ? <div className="max-w-xl mx-auto py-10 animate-fade-in px-4 sm:px-6 lg:px-8 text-center">
          {/* {(!isAuthenticated || isSubscriptionLoading || isRedirectingToPayment) && */}
          <h1 className="text-4xl font-bold mb-6 text-gray-800">Pricing</h1>
          {/* } */}
          <div id="pricing-status-container" className="mt-8"><p className="text-gray-600">Redirecting to payment gateway...</p></div></div> :
          <div className="container">
            <div className="pricing-card" role="region" aria-label="Pricing card">
              {/* Header */}
              <div className="card-header">
                <h2>Simple Pricing</h2>
                <p className="subtitle">Real Impact.</p>

                <div className="price" aria-hidden>
                  <span className="price-amount">$20</span>
                  <span className="price-period">/month</span>
                </div>

                <p className="tagline">Everything You Need to Search Smarter, Write Better, and Change Lives</p>
              </div>

              {/* CTA */}
              <div className="cta-section">
                <button
                  disabled={btnTxt !== "Start Your 5-Day Free Trial" && btnTxt !== "Subscribe Now"}
                  className={`cta-button disabled:cursor-default`}
                  type="button"
                  onClick={btnTxt === "Subscribe Now" ? createCheckoutSession : startFreeTrial}>
                  {btnTxt}
                </button>
                {btnTxt === "Start Your 5-Day Free Trial" ?
                  <p className="no-cc">No credit card required</p> :
                  btnTxt === "Subscription Active!" ?
                    <p className="no-cc">Enjoy unlimited access!</p> :
                    btnTxt.startsWith("Subscription ends in") ?
                      <p className="no-cc">
                        Undo cancellation in{" "}
                        <a
                          onClick={handleManagePlanClick}
                          href="#"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            textDecoration: "underline dotted",
                            cursor: "pointer",
                          }}
                        >
                          Manage Plan{" "}
                          <i className="fa fa-external-link" aria-hidden="true"></i>
                        </a>
                      </p>
                      : ""
                }
              </div>

              {/* Features */}
              <div className="features-section">
                <h3>What's Included</h3>

                <div className="feature-item">
                  <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="feature-text">Advanced AI search with instant, accurate answers</span>
                </div>

                <div className="feature-item">
                  <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="feature-text">Personalized responses tailored to you</span>
                </div>

                <div className="feature-item">
                  <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="feature-text">Professional writing assistance for all your work</span>
                </div>

                <div className="feature-item">
                  <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="feature-text">Enterprise-grade privacy and security</span>
                </div>

                <div className="feature-item">
                  <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="feature-text">24/7 access across all your devices</span>
                </div>
              </div>

              {/* Impact */}
              <div className="impact-section">
                <div className="impact-header">
                  <svg className="heart-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <h3>Your Subscription Creates Real Change</h3>
                </div>

                <p className="impact-description">
                  Every subscription directly funds Essential Families, transforming lives through economic mobility.
                </p>

                <div className="impact-item">
                  <svg className="impact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="impact-text">Free Chromebooks and broadband for families in need</span>
                </div>

                <div className="impact-item">
                  <svg className="impact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  <span className="impact-text">Digital skills training for economic advancement</span>
                </div>

                <div className="impact-item">
                  <svg className="impact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="impact-text">24/7 telehealth and parenting support</span>
                </div>

                <div className="impact-item">
                  <svg className="impact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="impact-text">Pathways to high-paying remote jobs and entrepreneurship</span>
                </div>

                <div className="stats-box">
                  <p>
                    <span className="stats-highlight">Nearly 1,000 families</span> already transformed • <span className="stats-highlight">1,800+</span> on the waitlist
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="footer-section">
                <p>Cancel anytime. No questions asked.</p>
                <p>Experience the full platform with zero commitment.</p>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="bottom-cta">
              <p className="bottom-text">Search sharper. Write smarter. Transform lives.</p>
              <Link to="/about-us" className="learn-more">
                Learn More About Our Impact
              </Link>
            </div>
          </div>)

        :
        <div className="max-w-xl mx-auto py-10 animate-fade-in px-4 sm:px-6 lg:px-8 text-center">
          {/* {(!isAuthenticated || isSubscriptionLoading || isRedirectingToPayment) && */}
          <h1 className="text-4xl font-bold mb-6 text-gray-800">Pricing</h1>
          {/* } */}
          <div id="pricing-status-container" className="mt-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative">
              <p className="font-bold mb-2">Access Denied</p>
              <p>Please log in to view pricing and subscription details.</p>
            </div>
          </div>
        </div>
      }
    </>
  );
}
