{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          bun
          vips
          pkg-config
        ];

        shellHook = ''
          echo "Bun dev environment loaded."
          export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath [ pkgs.vips ]}
        '';
      };
    };
}
