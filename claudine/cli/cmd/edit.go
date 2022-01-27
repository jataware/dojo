package cmd

import (
	"dojo/common"
	"errors"
	"github.com/spf13/cobra"
	"log"
	"os"
	"path/filepath"
)

var editCmd = &cobra.Command{
	Args:  cobra.ExactArgs(1),
	Use:   "edit <file>",
	Short: "Edit this file in the web editor",
	Long:  `Edit this file in the web editor`,
	Run: func(cmd *cobra.Command, args []string) {
		var NoFilesMatched *common.NoFilesMatchedError

		pattern := args[0]
		file, err := common.MatchOneFile(pattern)
		if err != nil {
			if errors.Is(err, NoFilesMatched) {
				cwd, err := os.Getwd()
				if err != nil {
					log.Fatalf("Error %+v", err)
				}
				file, err = filepath.Abs(filepath.Join(cwd, pattern))
				if err != nil {
					log.Fatalf("Error %+v", err)
				}
			} else {
				log.Fatal(err)
			}
		}
		log.Printf("Launching editor %s\n", file)
		common.SendCommand(common.COMMAND_EDIT, args, map[string]interface{}{"file": file})
	},
}

func init() {
	rootCmd.AddCommand(editCmd)
}
