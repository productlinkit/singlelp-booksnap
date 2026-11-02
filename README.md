
  # BOOKSNAP LP

  This is a code bundle for BOOKSNAP LP. The original project is available at https://www.figma.com/design/ZtnBIPgsNsqWVZX0MQW2r9/BOOKSNAP-LP.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Payment flow

  This is the frontend reference for the funnel. It takes no payment and has no backend.

  Landing → Reader → Paywall → Checkout → result

  | Screen | URL | What it does |
  | --- | --- | --- |
  | Checkout | reached from the Paywall | checks the format of each field, then shows Processing… |
  | Success | `/?checkout=success&plan=premium&billing=yearly` | tells the reader to check their email; Sign In to BookSnap goes to `https://apps.booksnap.ai/en/sign-in` |
  | Pending | `/?checkout=pending&plan=premium&billing=yearly` | Check Payment Status leads to Success |
  | Failed | `/?checkout=failed&plan=premium&billing=yearly` | Try Again returns to Checkout |

  At Checkout, any 16 digits pass and the last four choose the result: `0000` fails, `1111` is pending, and anything else succeeds.

  ### To build this for real

  - **Payment:** collect the card with Stripe Elements, never with these fields, and redirect back to the URLs above.
  - **Account:** a successful payment has to create the reader's account and activate their subscription. The live app sends a signed-in reader to onboarding when they have no categories, trial or subscription, and to `/profile/subscription/ended` when their trial is used up with no subscription.
  - **Temporary password:** once a payment succeeds, email the reader a temporary password for their BookSnap account. The success screen tells them to expect it, and the email address comes from the Checkout form.
  - **Analytics:** fire the real conversion event from the backend result. `demo_payment_result` is not a sale.

