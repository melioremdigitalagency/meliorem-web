# Security

This folder contains security-related modules and configurations for the One Page Budget web application.

## Structure

- `anti-bot/` - Anti-bot protection modules for form submissions

## Purpose

Security modules are separated from features, components, and pages to:
- Maintain clear ownership and responsibility
- Enable easy discovery and maintenance
- Support future security enhancements (rate limiting, fingerprinting, etc.)
- Follow the same organizational pattern as the `tracking/` folder

## Usage

Security modules are designed to be:
- **Modular** - Each security feature is self-contained
- **Reusable** - Can be integrated into any form or page
- **Configuration-driven** - Easy to extend and customize
- **Non-intrusive** - Minimal changes to existing code

## Adding New Security Features

1. Create a new subfolder: `security/{feature-name}/`
2. Add configuration, implementation, and documentation files
3. Follow the pattern established in `anti-bot/` module
4. Update this README with the new feature

