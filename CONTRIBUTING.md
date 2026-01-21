# Contributing to Cairo Security Cheatsheet

First off, thank you for considering contributing! 🎉

## How Can I Contribute?

### 🐛 Reporting Bugs

- Check if the issue already exists
- If not, create a new issue with:
  - Clear title and description
  - Steps to reproduce
  - Expected vs actual behavior

### 💡 Suggesting Enhancements

- Open an issue with the tag `enhancement`
- Describe the feature and its benefits
- Include examples if possible

### 📝 Improving Documentation

- Fix typos or unclear explanations
- Add more code examples
- Improve existing vulnerability descriptions
- Add Starknet-specific security context

### 🔒 Adding New Vulnerabilities

When adding a new vulnerability section:

1. Update the `VULNERABILITIES` array in `index.html`
2. Include:
   - Unique `id`
   - Section `number`
   - Clear `title` and `subtitle`
   - `severity` level (critical, high, medium, low)
   - Detailed `description`
   - `impact` explanation
   - Vulnerable and Secure Cairo 1.x code examples
3. Verify the dynamic sidebar updates correctly

### 🌐 Translations

We welcome translations! Create a new file like `index.es.html` for Spanish, etc.

## Pull Request Process

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Test locally by opening `index.html` in a browser
4. Ensure Cairo code examples are syntactically correct (ideally compiled with `scarb build`)
5. Update the README if needed
6. Submit the PR with a clear description

## Code Style

### HTML/CSS/JS
- Use 4 spaces for indentation
- Keep CSS variables in `:root`
- Maintain the Single Page Application (SPA) structure within `index.html`

### Cairo Examples
- Use Cairo 1.x syntax
- Use Starknet contract idiomatic patterns (attributes like `#[starknet::contract]`, etc.)
- Include comments explaining the vulnerability
- Show both vulnerable and secure versions

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn

## Questions?

Feel free to open an issue with the `question` tag.

---

Thank you for helping make Starknet smart contracts more secure! 🔐
