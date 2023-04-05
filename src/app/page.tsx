"use client";

import styles from "./page.module.css";

import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { WidgetStatus, JSONObject } from "../types";
import { TURNSTILE_SITEKEYS, CREATE_LINK_ENDPOINT } from "../constants";

const siteKey =
  process.env.NODE_ENV === "development"
    ? // Can be changed to pass, fail, and interactive
      TURNSTILE_SITEKEYS["pass"]
    : TURNSTILE_SITEKEYS["production"];

function getEmojiURL(key: string | null) {
  return key ?? `${location.origin}${key}`;
}

export default function Home() {
  const [status, setStatus] = useState<WidgetStatus>("unknown");
  const [token, setToken] = useState<string>("");
  const canSubmit = status === "solved" && token !== "";
  const [userURL, setUserURL] = useState("");

  const [response, setResponse] = useState<JSONObject | null>(null);
  const [loading, setLoading] = useState(false);
  const showResult = response && !loading;
  const [isCopied, setIsCopied] = useState(false);
  const emojiURL = getEmojiURL(response?.key as string);

  const turnstileRef = useRef<TurnstileInstance>(null);

  async function handleSubmitURL() {
    setLoading(true);
    setResponse(null);

    const res = await fetch(CREATE_LINK_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ token, url: userURL }),
      headers: { "content-type": "application/json" },
    });

    const data = await res.json();

    setLoading(false);
    setResponse(data);
  }

  function handleClickLink() {
    navigator.clipboard.writeText(emojiURL);
    setIsCopied(true);
  }

  return (
    <>
      {showResult && (
        <div className={styles["short-url"]} onClick={handleClickLink}>
          {emojiURL}
        </div>
      )}

      <section className={styles.hero}>
        <div className={styles["hero__image-container"]}>
          <img
            src="https://picsum.photos/485/244"
            alt="stock photo"
            className={styles["hero__image"]}
          />
        </div>
        <div className={styles["hero__form-container"]}>
          <div>
            <label
              id="url-input-label"
              htmlFor="url"
              className={styles["visually-hidden"]}
            >
              URL to shorten
            </label>
            <input
              className={styles["hero__form-url-input"]}
              required
              type="url"
              id="url"
              name="url"
              placeholder="http://ericbaer.com/"
              aria-describedby="url-input-label"
              value={userURL}
              onChange={(event) => {
                setUserURL(event.target.value);
              }}
            />

            <Turnstile
              className={styles["hero__turnstile"]}
              ref={turnstileRef}
              siteKey={siteKey}
              onError={() => setStatus("error")}
              onExpire={() => setStatus("expired")}
              onSuccess={(token) => {
                setToken(token);
                setStatus("solved");
              }}
            />

            <button
              aria-label="Shorten URL"
              className={styles["hero__form-submit-button"]}
              onClick={handleSubmitURL}
              disabled={!canSubmit || loading}
            >
              Submit
            </button>
          </div>
        </div>
      </section>

      <article className={styles.info}>
        <p>
          To learn how and why this works, check out my{" "}
          <a
            href="https://ericbaer.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            blog post
          </a>
          .
        </p>
      </article>
    </>
  );
}
