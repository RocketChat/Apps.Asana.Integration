#  🚀💬 RocketChat Apps.Asana.Integration


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Devansht420/Apps.Asana.Integration/">
    <img src="https://github.com/user-attachments/assets/2376e6f2-17ef-4fdf-82c2-2b3c37a8a694" alt="Logo" width="700" height="450">
  </a>

  <h3 align="center">RocketChat Apps.Asana.Integration</h3>
</div>





Introducing the Asana integration for RocketChat streamlines your team's workflow by bridging project tasks and conversations. Stay informed with relevant Asana notifications and quickly access task details within Rocket.Chat, reducing the need to switch apps and keeping collaboration smooth.



##  📜 Getting Started

### Prerequisites

- You need a Rocket.Chat Server Setup
- Rocket.Chat.Apps CLI, 
* In case you don't have run:
  ```sh
  npm install -g @rocket.chat/apps-cli
  ```
- Make sure to Enable development mode



### ⚙️ Installation
- Every RocketChat Apps runs on RocketChat Server, thus everytime you wanna test you need to deploy the app with this note. lets start setting up:

1. Clone the repo
   ```sh
   git clone https://github.com/<yourusername>/Apps.Asana.Integration
   ```
2. Install NPM packages

   - `cd Apps.Asana`
   
   - `npm i`

3. Deploy app using:
   ```sh
   rc-apps deploy --url <serverurl> --username <username> --password <password>
   ```
<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
>

4. Once its deploy, Go to Installed Apps and Settings tab in RC,you would see three input fields:
   
    ### Enter Your Client ID and Client Secret 
     You can find your client Id and client secret in your [Asana Developers console](https://app.asana.com/0/my-apps) after creating an App.
    ### Enter The Redirect URI in Asana Developers Console
     Go to Apps Settings and find a callback URL in App's details, copy this URL and enter it in the Redirect URI field in Asana Developers Console.
   ### Enter The Workspace ID in the Apps Settings
     Get your Asana Workspace ID from the Developers Console and enter it in the Apps Settings.

    

5. Once Its done save the changes.
  

<!-- ABOUT THE PROJECT -->
### Why we need Asana Integration?

Integrating Asana with RocketChat brings significant advantages for its community, particularly for teams coordinating project work. One notable benefit is the streamlined workflow and enhanced task awareness it offers. With the Asana integration, users receive relevant notifications about task updates, assignments, or comments directly within their Rocket.Chat channels. This not only minimizes the disruption of constantly switching applications but also fosters better alignment and quicker responses to project developments right within the team's primary communication space.
## 🚀 Usage :

```
     • To authorize your Asana App /asaba connect.
     • To get all your project details /asana projects.
     • To list all your tasks /asana my-tasks.
     • To list out all the recently created tasks /asana feed.
     • To get help of Usage use /asana help.
     • To get a summary of Tasks use /asana summary.

```


<!-- CONTRIBUTING -->
## 🧑‍💻 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request




## 📚 Resources
Here are some links to examples and documentation:
- [Rocket.Chat Apps TypeScript Definitions Documentation](https://rocketchat.github.io/Rocket.Chat.Apps-engine/)
- [Rocket.Chat Apps TypeScript Definitions Repository](https://github.com/RocketChat/Rocket.Chat.Apps-engine)
- [Example Rocket.Chat Apps](https://github.com/graywolf336/RocketChatApps)
- [DemoApp](https://github.com/RocketChat/Rocket.Chat.Demo.App)
- Community Forums
  - [App Requests](https://forums.rocket.chat/c/rocket-chat-apps/requests)
  - [App Guides](https://forums.rocket.chat/c/rocket-chat-apps/guides)
  - [Top View of Both Categories](https://forums.rocket.chat/c/rocket-chat-apps)
- [#rocketchat-apps on Open.Rocket.Chat](https://open.rocket.chat/channel/rocketchat-apps)
