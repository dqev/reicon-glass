import type { PlatformDoc } from "./types";

export const flutterDoc: PlatformDoc = {
  id: "flutter",
  name: "Flutter",
  badge: "Flutter",
  tagline: "Native Flutter package rendering vector icons directly with Flutter IconData widget.",
  pkg: "reicon_flutter",
  install: "flutter pub add reicon_flutter",
  basicUsage: `import 'package:flutter/material.dart';
import 'package:reicon_flutter/reicon_flutter.dart';

class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(Reicon.home, size: 24),
        Icon(Reicon.shieldCheck, size: 28, color: Color(0xFF9B8AFB)),
      ],
    );
  }
}`,
  notes: [
    "Custom vector font glyphs optimized for high DPI displays.",
    "Works on iOS, Android, Web, macOS, Windows, and Linux."
  ]
};
