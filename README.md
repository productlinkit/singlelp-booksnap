
  # BOOKSNAP LP

  This is a code bundle for BOOKSNAP LP. The original project is available at https://www.figma.com/design/ZtnBIPgsNsqWVZX0MQW2r9/BOOKSNAP-LP.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Payment flow

  This is the frontend reference for the funnel. It takes no payment and has no backend.

  Landing → Reader → Paywall → Checkout → result → Home

  | Screen | URL | What it does |
  | --- | --- | --- |
  | Checkout | reached from the Paywall | checks the format of each field, then shows Processing… |
  | Success | `/?checkout=success&plan=premium&billing=yearly` | goes to Home after 4 seconds, or on Start Reading |
  | Pending | `/?checkout=pending&plan=premium&billing=yearly` | Check Payment Status leads to Success |
  | Failed | `/?checkout=failed&plan=premium&billing=yearly` | Try Again returns to Checkout |
  | Home | `/?view=home` | the paid home screen, with no onboarding or tour |

  Checkout offers Credit Card and Stripe. With Credit Card, any 16 digits pass and the last four choose the result: `0000` fails, `1111` is pending, and anything else succeeds. Stripe only asks for an email and always succeeds; use the URLs above to see its other results.

  ### To build this for real

  - **Payment:** collect the card with Stripe Elements, never with these fields, and redirect back to the URLs above. Stripe usually processes the card too, so decide whether Stripe stays a separate option. The Stripe mark comes from simple-icons, so check it against Stripe's brand rules before launch.
  - **Account:** a successful payment has to create or sign in the reader and activate their subscription. The live app sends a signed-in reader to onboarding when they have no categories, trial or subscription, and to `/profile/subscription/ended` when their trial is used up with no subscription.
  - **Home:** replace `src/app/lp/Home.tsx` with a redirect to `https://apps.booksnap.ai/en/home`, and skip the app's 13-step home tour for these readers.
  - **Analytics:** fire the real conversion event from the backend result. `demo_payment_result` is not a sale.

