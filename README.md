# Pocket Grimoire v2

An upgraded version of the [Pocket Grimoire](https://www.pocketgrimoire.co.uk), designed to add new functionality and fix some of the issues plaguing the current version.

This project is still being built and might experience some breaking changes. Feel free to comment and make suggestions, but be aware that I might ignore them.

## To Do

This is an unsorted list of things that still need to be done:

### Functionality

#### Role Selection

- Select roles
- Highlight random
- Show "select multiple"
- Player selection "bag".
- Ability for Storyteller to assign a role to a player.
    - https://github.com/Skateside/pocket-grimoire/issues/83

#### Night Order

- Show player names.

#### Character Sheet

- Layout
- Hash encoding
    - Should this leave out information that isn't in `augments` so that roles can be translated on the sheet?
- QR code generation
- Validate the code on the sheet page
- Show any Fabled that have been added?

#### Storyteller Notes

- Empty `<textarea>` to take notes.

#### Game Pad

- Seats
    - One for each player
    - Show the name
    - Auto-position
        - Allow the user to say "where the circle starts".
        - https://github.com/Skateside/pocket-grimoire/issues/104
    - Can have tokens assigned
        - Including travellers
    - Can have reminders assigned
        - A reminder moved closer to Seat A than Seat B is assigned to Seat A
        - Moving the seat should move the reminders as well
    - Add a seat
    - Remove a seat
- Add a Fabled
    - Should be displayed on the pad somewhere.
- Add all relevant reminders
- Show token information
- Rotate token
- Rotate reminder
    - https://github.com/Skateside/pocket-grimoire/issues/105
- Shroud
- Replace token with another token
- Ghost vote
- Alternate alignment images.
    - https://github.com/Skateside/pocket-grimoire/issues/80
- See the game pad
    - Should prevent interactions
        - Seats/reminders can't be moved.
        - Buttons can't be pressed.
        - Page can be scrolled and zoomed.
    - Should hide some characters
        - **Magician** should hide the demon and itself for the **Spy**/**Widow**.
        - **Poppy Grower** hides everyone.
        - Should hide any associated reminders as well.

#### Demon Bluffs

- Groups
    - Group names
- Selection options shouldn't include already-added characters, unless ticked.
- Selection shouldn't be able to add characters like **Drunk**.
- A popup should show the bluffs.
- Should be able to select all 3 at the same time.
    - https://github.com/Skateside/pocket-grimoire/issues/101

#### Localisation

- Remember the seats
- Translate script title if possible?
    - https://github.com/Skateside/pocket-grimoire/issues/50

#### Settings

- Size of tokens
- Size of reminders

### Design

Do the design

- Maybe have tabs, rather than discloses.
    - It'll reuse `Tab`.
    - Make sure the the tab is remembered somehow.
- Create the frontend code in a more maintainable way.
    - https://github.com/Skateside/pocket-grimoire-2/issues/10
-

### Tidy Up

- `grepp 'todo' assets/ts/`
- Remove unused code and files.

## Future functionality

This is a collection of ideas that would be nice to have but I'm unlikely to do anything about them until I've finished the core functionality mentioned above.

- Allow users to include their own translations of the PG.
    - Probably handled through JSON.
- Styling for the tokens, so different sized images can be used
- Log of activity that's occured?
- Download all images.
    - https://github.com/Skateside/pocket-grimoire/issues/33
- Add character token to info token
    - Example: "This character selected you" with Cerenovus at the top.
    - https://github.com/Skateside/pocket-grimoire/issues/78
- Mark players who nominated / were nominated.
    - https://github.com/Skateside/pocket-grimoire/issues/106
