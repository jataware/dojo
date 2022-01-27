package cmd

import (
	"dojo/common"
	"github.com/spf13/cobra"
	"log"
)

var configCmd = &cobra.Command{
	Args:  cobra.ExactArgs(1),
	Use:   "config <file>",
	Short: "Opens the web configuration file annotation tool",
	Long:  `Opens the web configuration file annotation tool`,
	Run: func(cmd *cobra.Command, args []string) {
		file, err := common.MatchOneFile(args[0])
		if err != nil {
			log.Fatal(err)
		}
		log.Printf("Opening config for %s\n", file)
		common.SendCommand(common.COMMAND_CONFIG, args, map[string]interface{}{"file": file})
	},
}

func init() {
	rootCmd.AddCommand(configCmd)
}
