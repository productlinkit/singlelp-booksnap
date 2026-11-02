
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
  | Checkout | reached from the Paywall | asks for the email first, checks it, then shows what that account needs |
  | Success, new account | `/?checkout=success&plan=premium&billing=yearly` | tells the reader to check their email for a temporary password; Sign In to BookSnap goes to `https://apps.booksnap.ai/en/sign-in` |
  | Success, existing account | `/?checkout=success&plan=premium&billing=yearly&account=member` | tells the reader to sign in with their existing password |
  | Order details, on both Success screens | same URLs, plus `&order=<id>` | order ID, date, plan, email, payment method, free trial, paid today, and the next charge |
  | Pending | `/?checkout=pending&plan=premium&billing=yearly` | Check Payment Status leads to Success |
  | Failed | `/?checkout=failed&plan=premium&billing=yearly` | Try Again returns to Checkout |

  The email is checked when the field loses focus, or on Continue:

  | Email | Test with | Checkout shows | After paying |
  | --- | --- | --- | --- |
  | Not registered | any other address | card form | account created, password generated and emailed |
  | Registered, no subscription | `member@example.com` | card form | subscription active, existing password still works |
  | Registered and subscribed | `subscriber@example.com` | no card form, a banner, and a Login button that goes to sign-in | nothing to pay |

  The email and the card's last four digits reach the success screen in memory and stay out of the URL, so those two rows are hidden when the page is reloaded or opened by URL.

  Any 16 digits pass and the last four choose the result: `0000` fails, `1111` is pending, and anything else succeeds.

  ### To build this for real

  - **Email check:** replace `accountFor` in `src/app/lp/Checkout.tsx` with a backend lookup that returns one of the three cases. Rate limit it, because it tells anyone whether an email is registered and subscribed.
  - **Payment:** collect the card with Stripe Elements, never with these fields, and redirect back to the URLs above.
  - **Account:** a successful payment has to activate the reader's subscription, and create their account if the email is new. The live app sends a signed-in reader to onboarding when they have no categories, trial or subscription, and to `/profile/subscription/ended` when their trial is used up with no subscription.
  - **Temporary password:** once a new account's payment succeeds, generate a password and email it to the reader. The success screen tells them to expect it, and the email address comes from the Checkout form. Existing accounts keep their password and get no temporary one.
  - **Order details:** return the order ID, date, email, card's last four digits and next charge date from the backend. `newOrderId` and the dates in `OrderReceipt` stand in for them.
  - **Analytics:** fire the real conversion event from the backend result. `demo_payment_result` is not a sale.

