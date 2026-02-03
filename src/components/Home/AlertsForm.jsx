import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { showCustomToast } from '../../utils/customToast';
import { useAuthUtils } from '../../utils/useAuthUtils';

export default function AlertsForm() {
  const authToken = localStorage.getItem("authToken")
  const { logoutAndNavigate } = useAuthUtils();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    zip_code: '',
    phone: '',
    text_alerts: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!authToken) {
        showCustomToast("Login required!", { type: "error" });
        return
      }
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/save-alert-preferences/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      })
      const respJson = await resp.json()
      if (!resp.ok) {
        if (resp.status === 401) {
          showCustomToast("Session expired. Please log in again.", { type: "warn" });
          logoutAndNavigate()
        } else {
          showCustomToast(respJson, { type: "error" });
        }
      } else {
        showCustomToast("Your preferences have been updated.", { type: "success" });
      }
    } catch (err) {
      showCustomToast({ message: "Something went wrong" }, { type: "error" });
    }
  };

  useEffect(() => {
    async function fetch_alert_preferences() {
      try {
        const resp = await fetch(`${import.meta.env.VITE_API_URL}/fetch-alert-preferences/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        })
        const respJson = await resp.json()
        if (!resp.ok) {
          if (resp.status === 401) {
            showCustomToast("Session expired. Please log in again.", { type: "warn" });
            logoutAndNavigate()
          } else if (resp.status === 404) {
            // PREFERENCES NOT RETRIEVED SINCE NOT SAVED BY THE USER YET
          } else {
            showCustomToast(respJson, { type: "error" });
          }
        } else {
          setFormData({
            name: respJson.name,
            email: respJson.email,
            mobile: respJson.mobile,
            zip_code: respJson.zip_code,
            phone: respJson.phone,
            text_alerts: respJson.text_alerts
          });
        }
      } catch (err) {
        showCustomToast({ message: "Something went wrong" }, { type: "error" });
      }
    }

    if (authToken) fetch_alert_preferences()
  }, [])


  return (
    <div className={`max-w-2xl mx-auto p-6 bg-white my-6 border border-gray-200 rounded-lg`}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border-2 border-indigo-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Mobile</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="border-2 border-indigo-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border-2 border-indigo-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">ZIP</label>
            <input
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              className="border-2 border-indigo-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded">
          <img
            src="https://flagcdn.com/w20/us.png"
            alt="US Flag"
            className="w-6 h-4"
          />
          <span className="text-sm font-medium">+1</span>
          <input
            type="tel"
            name="phone"
            placeholder="phone number to receive alerts"
            value={formData.phone}
            onChange={handleChange}
            className="flex-1 border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-start space-x-3 pt-2">
          <input
            type="checkbox"
            name="text_alerts"
            id="textAlerts"
            checked={formData.text_alerts}
            onChange={handleChange}
            className="mt-1 w-4 h-4 border-2 border-gray-400 focus:ring-2 focus:ring-indigo-500"
          />
          <label htmlFor="textAlerts" className="text-sm">
            <span className="font-bold">Text me with alerts</span>
            <br />
            <span className="text-gray-700">
              By checking this box, you agree to receive marketing and promotional messages
              from Ask Carrie at the number provided. Reply STOP to opt out or HELP for help.
            </span>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition-colors"
        >
          Submit
        </button>
      </div>
    </div>
  );
}