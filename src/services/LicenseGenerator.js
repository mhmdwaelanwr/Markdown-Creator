class LicenseGenerator {
  static generate(type, year, author) {
    switch (type) {
      case 'MIT':
        return `MIT License\n\nCopyright (c) ${year} ${author}\n\nPermission is hereby granted, free of charge...`;
      case 'Apache 2.0':
        return `                                 Apache License\n                           Version 2.0, January 2004\n                        http://www.apache.org/licenses/\n\n   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION...`;
      case 'GPLv3':
        return `                    GNU GENERAL PUBLIC LICENSE\n                       Version 3, 29 June 2007\n\n Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>...`;
      case 'BSD 3-Clause':
        return `BSD 3-Clause License\n\nCopyright (c) ${year}, ${author}\nAll rights reserved...`;
      default:
        return 'License type not supported.';
    }
  }
}

export default LicenseGenerator;
